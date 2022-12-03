import { Server } from "./core";

const server = new Server()

server.use((req, res, next) => {
    console.log(req.body)
    next()
})

server.use((req, res, next) => {
    console.log(req.headers)
    next()
})

server.use((req, res) => {
    res.json(req.body)
})

server.listen(3000, (port) => {
    console.log(port)
})