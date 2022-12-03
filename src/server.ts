import { Server } from "./core";

const server = new Server()

server.use((req, res, next) => {
    console.log(req.headers)
    next()
})

server.use((req, res, next) => {
    console.log(req.url)
    next()
})

server.use((req, res) => {
    console.log(req.body)
    res.json(req.body)
})

server.listen(3000, (port) => {
    console.log(port)
})