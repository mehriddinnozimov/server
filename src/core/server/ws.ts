import { IncomingMessage, Server, ServerResponse } from "http";
import crypto from 'crypto'
import internal from "stream";



export class WS {
    private readonly WEBSOCKET_MAGIC_STRING_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    private readonly SEVEN_BITS_INTEGER_MARKER = 125
    private readonly SIXTEEN_BITS_INTEGER_MARKER = 126
    private readonly SIXTYFOUR_BITS_INTEGER_MARKER = 127
    private readonly FIRST_BIT = 128
    private readonly MAXIMUM_SIXTEENBITS_INTEGER = 2 ** 16
    private readonly MASK_KEY_BYTES_LENGTH = 4
    private readonly OPCODE_TEXT = 0x01

    constructor(app: Server<typeof IncomingMessage, typeof ServerResponse>) {
        app.on('upgrade', this.onSocketUpgrade.bind(this)) 
    }

    private onSocketUpgrade(req: IncomingMessage, socket: internal.Duplex, head: Buffer) {
        const { 'sec-websocket-key': clientKey } = req.headers
        if(!clientKey) throw new Error("CLIENT_KEY required")

        const headers = this.prepareHandShakeHeaders(clientKey)
        socket.write(headers)

        socket.on('readable', () => this.onSocketReadable(socket))

        const message = JSON.stringify(Array(128).fill({ ok: true }))
        this.sendMessage(message, socket)
    }

    private unmask(encodedBuffer: Buffer, maskKey: any){
        const finalBuffer = Buffer.from(encodedBuffer)
        for(let i = 0; i < encodedBuffer.length; i++) {
            finalBuffer[i] = finalBuffer[i] ^ maskKey[i % 4]
        }
        return finalBuffer
    }

    private sendMessage(msg: string, socket: internal.Duplex) {
        const dataFrameBuffer = this.prepareMessage(msg)
        socket.write(dataFrameBuffer)
    }

    private prepareMessage(msg: string) {
        const messageBuffer = Buffer.from(msg)
        const messageSize = messageBuffer.length

        let dataFrameBuffer
        let offset = 2

        const firstByte = 0x80 | this.OPCODE_TEXT
        if(messageSize <= this.SEVEN_BITS_INTEGER_MARKER) {
            const bytes = [firstByte]
            dataFrameBuffer = Buffer.from(bytes.concat(messageSize))
        } else
        if(messageSize <= this.MAXIMUM_SIXTEENBITS_INTEGER) {
            const offsetForBytes = 4
            const target = Buffer.allocUnsafe(offsetForBytes)
            target[0] = firstByte
            target[1] = this.SIXTEEN_BITS_INTEGER_MARKER | 0x0

            target.writeUInt32BE(messageSize, 0)
            dataFrameBuffer = target
        }
        else {
            throw new Error("Sending message too long!")
        }

        const totalLength = dataFrameBuffer.byteLength + messageSize
        const dataFrameResponse = this.concat([dataFrameBuffer, messageBuffer], totalLength)
        return dataFrameResponse
    }

    private concat(bufferList: Buffer[], totalLenght: number) {
        const target = Buffer.allocUnsafe(totalLenght)
        let offset = 0
        for(const buffer of bufferList) {
            target.set(buffer, offset)
            offset += buffer.length
        }
        return target
    }

    private onSocketReadable(socket: internal.Duplex) {
        socket.read(1)
        const [markedAndPayloadLength] = socket.read(1)
        const lengthIndecatorInBits = markedAndPayloadLength - this.FIRST_BIT
        let messageLength = 0

        if(lengthIndecatorInBits <= this.SEVEN_BITS_INTEGER_MARKER) {
            messageLength = lengthIndecatorInBits
        } else
        if(lengthIndecatorInBits === this.SIXTEEN_BITS_INTEGER_MARKER) {
            messageLength = socket.read(2).readUint16BE(0)
        }

        else {
            throw new Error("Received message too long!")
        }

        const maskKey = socket.read(this.MASK_KEY_BYTES_LENGTH)
        const encoded = socket.read(messageLength)
        const received = this.unmask(encoded, maskKey).toString('utf-8')
        console.log(received)
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
        const shaum = crypto.createHash('sha1')
        shaum.update(id + this.WEBSOCKET_MAGIC_STRING_KEY)

        return shaum.digest('base64')
    }
}