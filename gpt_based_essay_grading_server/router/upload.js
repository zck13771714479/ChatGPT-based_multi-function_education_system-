import express from 'express'

import multiparty from 'multiparty'
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/config.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router()
function multipartyUpload(req) {
    //使用multiparty对请求进行解析
    return new Promise((resolve, reject) => {
        new multiparty.Form({
            maxFieldsSize: 200 * 1024 * 1024,
            uploadDir: config.uploadDir
        }).parse(req, (err, fields, files) => {
            if (err) {
                reject(err)
                return
            }
            resolve({
                fields,
                files
            })
            return
        })
    })
}
function writeToUploadDir(file, dirPath, suffix, filename = '') {
    //写入文件
    // console.log(suffix);
    let md5 = crypto.createHash('md5')
    return new Promise((resolve, reject) => {
        //流式处理
        try {
            let readStream = fs.createReadStream(file.path)
            readStream.on('data', (chunk) => {
                md5.update(chunk)
            })
            readStream.on('end', () => {
                //连接写入流
                let hash = md5.digest('hex')
                let filePath
                if (!filename) {
                    filePath = path.resolve(dirPath, `${hash}.${suffix}`)
                } else {
                    filePath = path.resolve(dirPath, filename)
                }
                let writeStream = fs.createWriteStream(filePath)
                // 重新开始读取流，并将其pipe到写入流
                fs.createReadStream(file.path).pipe(writeStream);
                writeStream.on('finish', () => {
                    resolve(hash)
                    //删除临时文件
                    fs.unlink(file.path, (err) => {
                        if (err) {
                            throw err
                        }
                    })
                })
            })

        } catch (err) {
            reject(err)
        }

    })
}
function mergeChunk(hash, count, suffix) {
    return new Promise((resolve, reject) => {
        try {
            let dirPath
            if (suffix.toLowerCase() == 'pdf') {
                dirPath = path.resolve(config.uploadPdfDir, hash)
            } else {
                dirPath = path.resolve(config.uploadImgDir, hash)
            }
            let fileList = fs.readdirSync(dirPath)
            if (fileList.length < count) {
                reject('File has not been uploaded')
                return
            }
            fileList.sort((a, b) => {
                let reg = /-(\d+)/
                return reg.exec(a)[1] - reg.exec(b)[1]
            })
            let filePath = path.resolve(dirPath, `../${hash}.${suffix}`)
            fileList.forEach((item) => {
                let tmpFileChunk = path.resolve(dirPath, `${item}`)
                fs.appendFileSync(filePath, fs.readFileSync(tmpFileChunk))
                fs.unlinkSync(tmpFileChunk)
            })
            fs.rmdirSync(dirPath)
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}
router.post('/upload/checkHash', async (req, res) => {
    //断点续传进度检测
    let { hash, suffix } = req.body
    let dirPath
    if (suffix == 'pdf') {
        dirPath = path.resolve(config.uploadPdfDir, hash)
    } else {
        dirPath = path.resolve(config.uploadImgDir, hash)
    }
    let fileList = []
    try {
        if (fs.existsSync(dirPath)) {
            fileList = fs.readdirSync(dirPath)
            fileList.sort((a, b) => {
                let reg = /-(\d+)/
                return reg.exec(a)[1] - reg.exec(b)[1]
            })
        }
        res.send({
            code: 200,
            message: 'OK',
            fileList
        })
    } catch (err) {
        res.send({
            code: 201,
            message: 'Check Hash fail',
            errorMessage: err.message,
            flag: false
        })
    }
})
router.post('/upload/chunk', async (req, res) => {
    try {
        let { fields, files } = await multipartyUpload(req)
        let filename = (fields.filename && fields.filename[0]) || ''
        let hash = /^([a-zA-Z0-9]+)-(\d+)/.exec(filename)[1]
        let suffix = /\.([a-zA-Z0-9]+)$/.exec(filename)[1]
        let baseDir = suffix.toLowerCase() == 'pdf' ? config.uploadPdfDir : config.uploadImgDir
        let tmpDirPath = path.resolve(baseDir, hash)
        if (!fs.existsSync(tmpDirPath)) {
            fs.mkdirSync(tmpDirPath)
        }
        let file = (files.file && files.file[0]) || {}
        await writeToUploadDir(file, tmpDirPath, suffix, filename)
        res.send({
            code: 200,
            message: 'Upload chunk success',
            flag: true
        })
    } catch (err) {
        res.send({
            code: 201,
            message: 'Upload chunk fail',
            errorMessage: err.message,
            flag: false
        })
    }
})
router.post('/upload/mergeChunk', async (req, res) => {
    try {
        let { hash, count, suffix } = req.body
        await mergeChunk(hash, count, suffix)
        res.send({
            code: 200,
            message: 'OK',
            hash
        })
    } catch (err) {
        res.send({
            code: 201,
            message: 'Merge chunk fail',
            errorMessage: err.message,
            flag: false
        })
    }
})
router.post('/upload/getFileURL', (req, res) => {
    //获取pdf的URL
    let { hash, type } = req.body
    // console.log(hash, type);
    if (hash && typeof hash == 'string') {
        let url
        if (type.toLowerCase().trim() == 'typed' || type.toLowerCase().trim() == 'question') {
            url = `http://${req.hostname}:${config.port}/upload/pdf/${hash}.pdf`
        } else {
            let imgDirPath = config.uploadImgDir
            let jpgPath = path.resolve(imgDirPath, `${hash}.jpg`)
            let pngPath = path.resolve(imgDirPath, `${hash}.png`)
            let suffix = ''
            if (fs.existsSync(jpgPath)) {
                suffix = '.jpg'
            } else {
                suffix = '.png'
            }
            url = `http://${req.hostname}:${config.port}/upload/images/${hash}${suffix}`
        }
        res.send({
            code: 200,
            message: 'OK',
            url
        })
    } else {
        res.send({
            code: 201,
            message: 'Invalid hash value, hash should be a string',
            flag: false
        })
    }
})



router.post('/upload/single', async (req, res) => {
    try {
        // console.log(req)
        let { fields, files } = await multipartyUpload(req)
        if (files.file && files.file[0]) {
            let fileToUpload = files.file[files.file.length - 1]
            let filename = (fields.filename && fields.filename[0]) || ''
            let suffix = ''
            if (filename) {
                suffix = /\.([a-zA-Z0-9]+)$/.exec(filename)[1];
            }
            let writePath = suffix.toLowerCase() == 'pdf' ? config.uploadPdfDir : config.uploadImgDir
            let hash = await writeToUploadDir(fileToUpload, writePath, suffix)
            res.send({
                code: 200,
                message: 'Upload success',
                flag: true,
                hash
            })
        }
    } catch (err) {
        res.send({
            code: 201,
            message: 'Upload fail',
            errorMessage: err.message,
            flag: false
        })
        console.log(err.message)
    }

})


export default router