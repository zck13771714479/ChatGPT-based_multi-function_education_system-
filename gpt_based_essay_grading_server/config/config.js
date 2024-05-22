import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    port: 11451, //监听的端口
    uploadPdfDir: path.resolve(__dirname, '../upload/pdf'), //上传pdf的文件夹的路径
    uploadImgDir: path.resolve(__dirname, '../upload/images'), //上传图片的文件夹的路径
    uploadDir: path.resolve(__dirname, '../upload'), //上传总文件夹的路径
    proxy: {
        host: '127.0.0.1',//代理服务器域名或者ip
        port: 7890 //代理服务器端口
    }
}