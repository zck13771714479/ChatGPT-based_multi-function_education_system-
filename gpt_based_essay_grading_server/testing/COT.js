import { fileURLToPath } from 'url';
import OpenAI from 'openai'
import tunnel from 'tunnel'
import config from '../config/config.js'
import { readFile } from 'fs';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    httpAgent: tunnel.httpsOverHttp({
        proxy: config.proxy
    }),
});

const promptForCOT = `Imagine you are evaluating a piece of text across six different dimensions: Coherence, Consistency, Fluency, Relevance, Comprehensibility, and Exhaustiveness. For each of these dimensions:

Coherence: Describe what makes a text coherent, including how ideas should flow and connect within the text.
Consistency: Explain the importance of maintaining a consistent tone, perspective, and set of facts throughout the text.
Fluency: Outline what constitutes fluent text, focusing on grammar, syntax, and the natural flow of language.
Relevance: Discuss how to assess whether the text stays on topic and aligns with the intended message or question.
Comprehensibility: Detail the factors that contribute to the ease with which the average reader can understand the text.
Exhaustiveness: Describe how to evaluate if the text thoroughly addresses the topic, including necessary details and explanations.
For each dimension, please provide a step-by-step thought process that you would follow to evaluate a text's quality based on that criterion.`

let result = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'system', content: promptForCOT }],
    temperature: 0.2,
    stream: true
});
let text = ''
for await (const chunk of result) {
    text += chunk.choices[0]?.delta?.content || ""
}


