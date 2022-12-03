import { Server } from "./core";

const server = new Server()

server.use((req, res) => {
    console.log(req.body)
    res.status(200).json(req.body)
})

server.listen(3000, (port) => {
    console.log(port)
})