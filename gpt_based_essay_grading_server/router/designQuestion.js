import express from 'express'
import path from 'path'

import { fileURLToPath } from 'url';
import { bootstrap } from "global-agent";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { Redis } from "ioredis";
import { CacheBackedEmbeddings } from "langchain/embeddings/cache_backed";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { RedisByteStore } from "@langchain/community/storage/ioredis";

// process.env['GLOBAL_AGENT_HTTP_PROXY'] = 'http://127.0.0.1:7890';
// process.env['OPENAI_API_KEY'] = 'sk-xxxxxx'

bootstrap()
const router = express.Router()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const redisClient = new Redis({
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    db: 1,
})
redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});
const redisStore = new RedisByteStore({
    client: redisClient,
    ttl: 15 * 60
})

const chatModel = new ChatOpenAI({});

const chatHistory = new Map()
const systemPromptMap = new Map()
const retrieverMap = new Map()



const fifteenMinute = 15 * 60 * 1000
setInterval(() => {
    checkAndDeleteKeys(chatHistory, fifteenMinute)
    checkAndDeleteKeys(systemPromptMap, fifteenMinute)
    checkAndDeleteKeys(retrieverMap, fifteenMinute)
}, fifteenMinute)
function checkAndDeleteKeys(map, timeLimit) {
    let keysToDelete = []
    map.forEach((value, key) => {
        if (Date.now() - value.timestamp > timeLimit) {
            keysToDelete.push(key)
        }
    })
    for (let i = 0; i < keysToDelete.length; i++) {
        map.delete(keysToDelete[i])
    }
}





router.post('/setQuestionPrompt', (req, res) => {
    let { questionForm } = req.body
    const systemPrompt = `You are a professional AI to design final exam questions for university students
    You should design the relevant questions according to the given class slides.
    At first, You should design ${questionForm.questionNumber} ${questionForm.questionType} questions, which is relevant to the slides
    The main topic of the class is ${questionForm.mainTopic}. The key knowledge points are ${questionForm.keyKnowledgePoints}.
    The difficult level should be ${questionForm.difficultLevel}. 
    ${questionForm.additonalTips}
    Then, start to design questions with given slides {context}
    `
    let uid = questionForm.uid
    chatHistory.set(uid, {
        content: [],
        timestamp: Date.now()
    })
    systemPromptMap.set(uid, {
        content: systemPrompt,
        timestamp: Date.now()
    })
    res.send({
        code: 200,
        message: 'OK'
    })
})

function sessionExist(uid) {
    return systemPromptMap.has(uid) && chatHistory.has(uid) && retrieverMap.has(uid)
}
function updateChatHistory(uid, message, type) {
    let curChatHistory = chatHistory.get(uid).content
    let messageInstance
    if (type == 'ai') {
        messageInstance = new AIMessage(message)
    } else {
        messageInstance = new HumanMessage(message)
    }
    curChatHistory.push(messageInstance)
    chatHistory.set(uid, {
        content: curChatHistory,
        timestamp: Date.now()
    })
}

router.get('/designQuestion', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');


    let { hash, uid, question } = req.query
    let filename = path.resolve(__dirname, '../upload/pdf', `${hash}.pdf`)

    // console.log(hash, uid, question);


    if (!sessionExist(uid)) {
        // 首次请求, 加载文件，向量化，建立有历史记忆的retriever
        // load pdf
        const loader = new PDFLoader(filename)
        const docs = await loader.load();
        //split text
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 300,
            chunkOverlap: 30
        })
        const splitDocs = await textSplitter.splitDocuments(docs)
        //create retriever
        const underlyingEmbeddings = new OpenAIEmbeddings()
        const cacheBackedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
            underlyingEmbeddings,
            redisStore,
            {
                namespace: underlyingEmbeddings.modelName,
            }
        );
        const vectorStore = await FaissStore.fromDocuments(splitDocs, cacheBackedEmbeddings)
        const retriever = (await vectorStore).asRetriever()
        // retriever prompt
        const historyRetrieverPromptTemplate = ChatPromptTemplate.fromMessages([
            new MessagesPlaceholder("chat_history"),
            ["user", "{input}"],
            [
                "user",
                "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
            ],
        ])
        // create retriever with history memory
        const historyRetriver = await createHistoryAwareRetriever({
            llm: chatModel,
            retriever,
            rephrasePrompt: historyRetrieverPromptTemplate
        })
        retrieverMap.set(uid, {
            content: historyRetriver,
            timestamp: Date.now()
        })
    }
    const llmPromptTemplate = ChatPromptTemplate.fromMessages([
        ['system', systemPromptMap.get(uid).content],
        new MessagesPlaceholder("chat_history"),
        ['user', '{input}']
    ])

    const combineDocsChain = await createStuffDocumentsChain({
        llm: chatModel,
        prompt: llmPromptTemplate
    })

    const retrieverChain = await createRetrievalChain({
        retriever: retrieverMap.get(uid).content,
        combineDocsChain
    })


    let ipt = ''
    if (question !== undefined) {
        updateChatHistory(uid, question, 'human')
        ipt = question
    }
    // console.log('@@@', ipt);
    let ans = await retrieverChain.stream({
        chat_history: chatHistory.get(uid).content,
        input: ipt
    })
    let aiAnswer = ''
    for await (const part of ans) {
        if (part.answer !== undefined) {
            aiAnswer += part.answer
            let message = part.answer
            message = message.replaceAll(/\n/g, '<br>')
            res.write(`data: ${message}\n\n`)
        }
    }
    res.write(`data: messageEND\n\n`)
    updateChatHistory(uid, aiAnswer, 'ai')
})

export default router