'use strict'

// 蜜柑计划域名
const mikan_domain = 'mikanani.me'

export default {
    async fetch(request, env, ctx) {
        let url = new URL(request.url) // 解析请求URL
        // 代理的域名
        let worker_domain = url.hostname
        const pathname = url.pathname

        const newUrl = new URL(`https://${ mikan_domain }${ pathname }${ url.search }`)

        // 复制原始请求的标头
        const headers = new Headers(request.headers)
        // 修改请求头中的 host
        for (let key of headers.keys()) {
            const origin = headers.get(key)
            headers.set(key, origin.replaceAll(worker_domain, mikan_domain))
        }

        return fetch(newUrl, {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
            redirect: 'follow',
        }).then(async response => {
            if (pathname.startsWith('/RSS/MyBangumi')) {
                const text = await response.text()
                return new Response(text.replaceAll(mikan_domain, worker_domain), {
                    headers: response.headers, status: response.status, statusText: response.statusText,
                })
            }
            return response
        })
    },
}
