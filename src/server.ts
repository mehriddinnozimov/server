import { Server, Router, Request, Response } from "./core";


const server = new Server()

const router = new Router()

router.post('/:id1/status/:id2', (req, res) => {
    console.log('params', req.params)
    console.log('body', req.body)
    console.log('query', req.query)
    res.json({ router: true })
})


server.use( async (req, res) => {
    console.log(1, 'use')
})

server.use('/router', router)

server.get('/', (req, res) => {
    res.json({ ok: true })
})

server.post('/url', (req, res) => {
    res.json(req.body)
})

server.use('*', (req, res) => {
    res.json({ everything: "*" })
})

server.listen(3000, (port) => {
    console.log(port)
})