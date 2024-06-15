'use strict'

// 蜜柑计划域名
const mikan_domain = 'mikanani.me'
// 自定义的服务器地址
let workers_url = 'https://访问的域名'

async function nginx() {
    return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="https://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="https://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
}

export default {
    async fetch(request, env, ctx) {
        let url = new URL(request.url) // 解析请求URL
        workers_url = `https://${ url.hostname }`
        const pathname = url.pathname

        if (env.URL302) {
            return Response.redirect(env.URL302, 302)
        } else if (env.URL) {
            if (env.URL.toLowerCase() == 'nginx') {
                //首页改成一个nginx伪装页
                return new Response(await nginx(), {
                    headers: {
                        'Content-Type': 'text/html; charset=UTF-8',
                    },
                })
            } else return fetch(new Request(env.URL, request))
        }

        const newUrl = new URL(`https://${ mikan_domain }${ pathname }${ url.search }`)

        // 复制原始请求的标头
        const headers = new Headers(request.headers)
        // 修改请求头中的 host
        headers.set('Host', mikan_domain)

        const newRequest = new Request(newUrl, {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
            redirect: 'follow',
        })

        return fetch(newRequest)
    },
}
