import { Server } from "./core";

const server = new Server()

server.use( async (req, res) => {
    console.log(1)
})

server.get('/', (req, res) => {
    res.json({ ok: true })
})

server.post('/url', (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

server.use('*', (req, res) => {
    res.json({ everything: "*" })
})

server.listen(3000, (port) => {
    console.log(port)
})