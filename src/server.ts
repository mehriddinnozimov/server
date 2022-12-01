import http from 'http'
import Request from './core/request'

const server = http.createServer(async (req, res) => {
    try {
        const request = new Request(req)
        await request.json()

        console.log(request.headers)

        console.log(request.body)

        res.end('ok')
    } catch (err) {
        console.log(err)

        res.end('false')
    }

})

server.listen(3000)
