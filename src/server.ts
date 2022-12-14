// import { writeFileSync } from "fs";
// import { Server, Router, Request, Response } from "./core";


// const server = new Server()
// const ws = server.websocket()
// const router = new Router()

// server.static(__dirname + '/static')


// const sockets: string[] = []


// ws.on('connection', (socket) => {
//     sockets.push(socket.uid)
//     console.log(socket.uid)
//     socket.on('data', (data) => {
//         console.log(data)
//     })
//     socket.emit('message', { isMessage: true })
// })

// router.post('/:id1/status/:id2', (req, res) => {
//     console.log('params', req.params)
//     console.log('body', req.body)
//     console.log('query', req.query)
//     console.log('file', req.file)
//     if(!req.file) throw new Error('file is required')
//     writeFileSync(__dirname + '/' + req.file.originalname, req.file.buffer)
//     res.json({ router: true })
// })

// router.get('/', (req, res) => {
//     console.log('router get')
//     res.json({ get: true })
// })


// server.use( async (req, res) => {
//     console.log(1, 'use')
    
// })

// server.use('/router', router)

// server.get('/', (req, res) => {
//     console.log(123)
//     res.status(201).sendFile(__dirname + '/static/tsconfig.json')
// })

// server.get('/some', (req, res) => {
//     console.log(123)
//     res.sendFile(__dirname + '/static/tsconfig.json')
// })

// server.post('/url', (req, res) => {
//     res.json(req.body)
// })

// // server.use('*', (req, res) => {
// //     console.log('everything')
// //     res.json({ everything: "*" })
// // })

// server.listen(3000, (port) => {
//     console.log(port)
// })


import { JDB, types, Schema, Model } from "./core/db";

const s: Schema = {
    id: types.UID,
    name: types.CHAR,
    num: types.NUMBER,
    int: types.INTEGER,
    email: types.CHAR,
    bool: types.BOOLEAN,
    auto: {
        type: types.INTEGER,
        autoIncrement: 'ASC',
        defaultValue: -10
    }
}

async function boostrap() {

    const database = new JDB(__dirname, 'app')
    
    const userModel = new Model('user', s)
    database.addModel(userModel)

    await database.init()

    await userModel.create({ name: '3', email: '', num: 2, int: 1, bool: false })

    const data = await userModel.find({  })
    console.log(data)

}
boostrap()