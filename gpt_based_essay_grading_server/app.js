// Importing modules using ES Module syntax
import './utils/envConfig.js'
import express from 'express';
import cors from 'cors';
import path from 'path';
import uploadRouter from './router/upload.js';
import gradeRouter from './router/essayGrading.js';
import criteriaRouter from './router/criteria.js';
import designQuestionRouter from './router/designQuestion.js'
import config from './config/config.js';
import { fileURLToPath } from 'url';


const app = express()
app.use(cors())
app.use(express.json())



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/upload', express.static(path.join(__dirname, 'upload')));

let baseURL = '/api'
app.use(baseURL, uploadRouter)
app.use(baseURL, gradeRouter)
app.use(baseURL, criteriaRouter)
app.use(baseURL, designQuestionRouter)
app.get('/test', (req, res) => {
  res.send({
    code: 200,
    msg: 'success',
    query: req.query
  })
})
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Server error')
})
app.listen(config.port, () => {
  console.log(`listen on ${config.port}`)
})