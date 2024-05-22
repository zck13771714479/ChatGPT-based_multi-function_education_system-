import { fileURLToPath } from 'url';
import OpenAI from 'openai'
import tunnel from 'tunnel'
import config from '../config/config.js'
import { readFile } from 'fs';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const cot = `There are steps of thinking and grading.Coherence:
To evaluate coherence, one would look at how ideas are connected and flow within the text. A coherent text should have a logical progression of ideas, with each paragraph or section building on the previous one. Transitions should be used to guide the reader from one idea to the next. To evaluate coherence, follow these steps:
1. Identify the main idea or thesis of the text.
2. Check if each paragraph or section supports and expands on the main idea.
3. Look for transition words and phrases that link ideas together.
4. Determine if the ideas flow logically from one to the next.

Consistency:
Consistency involves maintaining a steady tone, perspective, and set of facts throughout the text. Inconsistent tone or perspective can confuse readers, while inconsistent facts can undermine the credibility of the text. To evaluate consistency:
1. Identify the tone, perspective, and key facts of the text.
2. Check if the tone remains the same throughout the text.
3. Verify if the perspective stays consistent.
4. Cross-check the facts to ensure they don't contradict each other.

Fluency:
Fluent text is grammatically correct, follows standard syntax, and flows naturally. It should be easy to read aloud and sound natural to the ear. To evaluate fluency:
1. Read the text aloud to check if it sounds natural.
2. Look for grammatical errors.
3. Check if the sentences follow standard English syntax.
4. Determine if the text flows smoothly, without awkward phrasing or abrupt changes in style.

Relevance:
Relevance involves staying on topic and aligning with the intended message or question. Irrelevant information can distract the reader and weaken the overall argument. To evaluate relevance:
1. Identify the main topic or question the text is supposed to address.
2. Check if each paragraph or section directly relates to this topic or question.
3. Look for any information that seems off-topic or irrelevant.
4. Determine if the text successfully addresses the main topic or question.

Comprehensibility:
Comprehensibility refers to how easily the average reader can understand the text. It involves factors like vocabulary, sentence complexity, and clarity of ideas. To evaluate comprehensibility:
1. Check if the vocabulary is appropriate for the intended audience.
2. Look at sentence complexity, checking for overly long or convoluted sentences.
3. Determine if the ideas are clearly expressed and easy to understand.

Exhaustiveness:
Exhaustiveness involves thoroughly addressing the topic, including all necessary details and explanations. A text that lacks exhaustiveness may leave the reader with unanswered questions. To evaluate exhaustiveness:
1. Identify the main topic or question the text is supposed to address.
2. Check if the text provides all necessary details and explanations.
3. Look for any areas where the text seems to skim over important information.
4. Determine if the text leaves you with any unanswered questions about the topic.`

const promptSystem = `You should grade the given text in six different dimensions: Coherence, Consistency, Fluency, Relevance, Comprehensibility, and Exhaustiveness. The grade should between 1 to 10, 1 means bad 10 means good. You should only give the grades of each dimension`

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    httpAgent: tunnel.httpsOverHttp({
        proxy: config.proxy
    }),
});

readFile(path.resolve(__dirname, 'backup1.txt'), 'utf-8', async (err, data) => {
    let result = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'system', content: promptSystem }
            , { role: 'system', content: cot },
        { role: 'user', content: data }],
        temperature: 0.2,
        stream: true
    })
    let text = ''
    for await (const chunk of result) {
        text += chunk.choices[0]?.delta?.content || ""
    }
    console.log(text);
})