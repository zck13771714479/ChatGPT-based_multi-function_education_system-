export default ({ $axios }, inject) => {
    const request = (function () {
        const urlSet = new Set()
        return function (url, data = {}, options = {}, method = 'POST') {
            if (urlSet.has(url)) {
                //防止频繁请求
                return Promise.reject('The request is processing')
            }
            urlSet.add(url)
            let contentType = ''
            if (process.client && data instanceof FormData) {
                contentType = 'multipart/form-data'
            } else {
                contentType = 'application/json'
            }

            $axios.setHeader('Content-Type', contentType)
            $axios.onRequest((config) => {
                let { params, headers } = options
                if (Object.keys(data).length > 0 && params) {
                    //同时设置data和params，params无效
                    config.params = {}
                    config.data = data
                }
                //设置其他请求头
                config.headers = {
                    ...config.headers,
                    ...headers
                }
                return config
            })
            $axios.onResponse((response) => {
                return response.data
            })
            delete options.data
            delete options.headers
            return $axios({
                url,
                method,
                data,
                ...options
            }).then((response) => {
                urlSet.delete(url)
                return response
            }).catch((err) => {
                if (urlSet.has(url)) {
                    urlSet.delete(url)
                }
                return Promise.reject(err)
            })

        }
    })()
    inject('initAxios', $axios)
    inject('request', request)
}