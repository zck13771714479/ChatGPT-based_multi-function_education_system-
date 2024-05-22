import express from 'express'

import extract from 'pdf-text-extract'
import Tesseract from 'tesseract.js'
import path from 'path'
import OpenAI from 'openai'
import tunnel from 'tunnel'
import config from '../config/config.js'
import { getData } from '../utils/dataStore.js'
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router()
function getTextFromPDF(filePath) {
    //pdf to text
    return new Promise((resolve, reject) => {
        extract(filePath, function (err, data) {
            if (err) {
                console.dir(err)
                reject(err)
                return
            } else {
                let text = data.join('')
                resolve(text)
            }

        })
    })
}
function OCRFromImage(filePath) {
    return new Promise(async (resolve, reject) => {
        let res = await Tesseract.recognize(
            filePath,
            'eng',
        )
        resolve(res.data.text)
    })
}

function mockAnswer(res) {
    let mockText = `## Aims and Objectives

    **Grade**: 8
    
    **Evaluate**: The article ai
    
    **Aims of the article**: The ar`
    let index = 0; // 当前发送的字符位置
    let message = ''

    // 设置定时器，每50ms秒发送字符
    const intervalId = setInterval(() => {
        if (index < mockText.length) {
            // 发送当前字符
            message += mockText[index]
            if (message.endsWith('\n')) {
                message = message.replaceAll(/\n/g, '<br>')
                // console.log(message)
                res.write(`data: ${message}\n\n`)
                message = ''
            }
            index++
        } else {
            // 发送结束信号并清除定时器
            res.write(`data: messageEND\n\n`)
            res.end()
            clearInterval(intervalId);
        }
    }, 50);
}

router.get('/mockGrade', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    mockAnswer(res)

})
router.get('/grade', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    let { hash, uid, suffix, question } = req.query
    // console.log('评分uid',uid);

    let prompt = getData(`prompt${uid}`).evaluate
    let advancedForm = getData(`form${uid}`).advancedForm
    // console.log(prompt, advancedForm)

    let filePath
    let text
    if (!suffix || suffix.toLowerCase() == 'pdf') {
        filePath = path.resolve(__dirname, '../upload/pdf', `${hash}.pdf`)
        text = await getTextFromPDF(filePath)
    } else {
        filePath = path.resolve(__dirname, '../upload/images', `${hash}.${suffix}`)
        text = await OCRFromImage(filePath)
    }
    let message = ''
    askQuestion(text)
    // mockAnswer(res)
    async function askQuestion(text) {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            httpAgent: tunnel.httpsOverHttp({
                proxy: config.proxy
            }),
        });
        let result
        if (!question) {
            result = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'system', content: prompt },
                { role: 'user', content: text }
                ],
                stream: true,
                temperature: advancedForm.temperature
            });
        } else {
            result = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'assistant', content: text },
                { role: 'user', content: question }
                ],
                stream: true,
                temperature: advancedForm.temperature
            });
        }
        // console.log('到之前了')
        for await (let part of result) {
            message += part.choices[0]?.delta?.content || ''
            // console.log(message)
            if (part.choices[0]['finish_reason'] == 'stop') {
                message += '\n'
            }
            if (message.endsWith('\n')) {
                message = message.replaceAll(/\n/g, '<br>')
                res.write(`data: ${message}\n\n`)
                message = ''
            }
            if (part.choices[0]['finish_reason'] == 'stop') {
                res.write(`data: messageEND\n\n`)
            }
            // process.stdout.write(part.choices[0]?.delta?.content || '')
        }

    }

})



export default router