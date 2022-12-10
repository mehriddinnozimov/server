import { IncomingMessage, Server, ServerResponse } from "http";
import { createHash } from 'crypto'
import { Duplex } from "stream";
import { EventEmitter } from "../eventEmitter";
import { readFile } from "fs/promises";
import { Socket } from "./ws_server";

export class WS extends EventEmitter {
    private readonly WEBSOCKET_MAGIC_STRING_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    private sockets: Socket[] = []
    private readonly _app: Server<typeof IncomingMessage, typeof ServerResponse>
    constructor(app: Server<typeof IncomingMessage, typeof ServerResponse>) {
        super()
        this._app = app
        this._app.on('request', async (req, res) => {
            if(req.url === '/ws_client.js' && req.method === 'GET') {
                res.setHeader('Content-Type', 'application/javascript')
                const wsClientBuffer = await readFile(__dirname + '/ws_client.js')
                res.write(wsClientBuffer)
                res.end()
            }
        })

    }

    public to(uid: string) {
        const socket = this.sockets.find(s => s.uid === uid)
        if(!socket) throw new Error("Socket uid not found")
        return socket
    }
    public on(event: 'connection', listener: (socket: Socket) => void)
    public on(event: string, listener) {
        if(event === 'connection') {
            this._app.on('upgrade', (req, socketDuplex, head) => {
                const { 'sec-websocket-key': clientKey } = req.headers
                if(!clientKey) throw new Error("CLIENT_KEY required")
        
                const headers = this.prepareHandShakeHeaders(clientKey)
                socketDuplex.write(headers)
                const socket = new Socket(socketDuplex)
                this.sockets.push(socket)
                listener(socket)
            }) 
        } else {
            super.on(event, listener)
        }
        return this

    }

    private prepareHandShakeHeaders(id: string) {
        const acceptKey = this.createSocketAccept(id)
        const headers = [
            'HTTP/1.1 101 Switching Protocols',
            'Upgrade: websocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${acceptKey}`,
            ''
        ].map(line => `${line}\r\n`).join('')

        return headers
    }

    private createSocketAccept(id: string) {
        const shaum = createHash('sha1')
        shaum.update(id + this.WEBSOCKET_MAGIC_STRING_KEY)

        return shaum.digest('base64')
    }
}