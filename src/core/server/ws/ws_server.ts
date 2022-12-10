import { Duplex } from "stream";
import { WS } from ".";
import { EventEmitter } from "../eventEmitter";

export class Socket {
    private readonly WEBSOCKET_MAGIC_STRING_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    private readonly SEVEN_BITS_INTEGER_MARKER = 125
    private readonly SIXTEEN_BITS_INTEGER_MARKER = 126
    private readonly SIXTYFOUR_BITS_INTEGER_MARKER = 127
    private readonly FIRST_BIT = 128
    private readonly MAXIMUM_SIXTEENBITS_INTEGER = 2 ** 16
    private readonly MASK_KEY_BYTES_LENGTH = 4
    private readonly OPCODE_TEXT = 0x01
    uid: string;
    private readonly _socket: Duplex;
    private readonly eventEmitter = new EventEmitter()
    constructor(socket: Duplex) {
        this.uid = this.createUid()
        this._socket = socket

        this._socket.on('readable', () => {
            this.onSocketReadable(socket)
        })
    }

    on(event: string, listener: (data: any) => void) {
        if(event === 'disconnect') {
            this._socket.end()
        } else {
            this.eventEmitter.on(event, listener)
        }
    }

    private sendOn(event: string, message: Object) {
        this.eventEmitter.emit(event, message)
    }

    off(event: string, listener: Function) {
        this.eventEmitter.off(event, listener)
    }

    private unmask(encodedBuffer: Buffer, maskKey: any){
        if(!encodedBuffer) return;
        const finalBuffer = Buffer.from(encodedBuffer)
        for(let i = 0; i < encodedBuffer.length; i++) {
            finalBuffer[i] = finalBuffer[i] ^ maskKey[i % 4]
        }
        return finalBuffer
    }

    private onSocketReadable(socket: Duplex) {
        if(socket.readableLength < 1) return;
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

        try {
            const { event, ...message } = JSON.parse(received) as { event: string, [key: string | number | symbol]: any }
            this.sendOn(event, message)
        } catch (err) {
        }
    }

    emit(event: string, message: any) {
        const data = {
            uid: this.uid,
            event,
            message
            
        }
        console.log(data)
        
        this.sendMessage(JSON.stringify(data))
        return this
    }

    createUid(){
        return `${Math.ceil(Math.random() * 1000000 )}${Date.now()}`.padStart(20, '0')
    }

    private sendMessage(msg: string) {
        const dataFrameBuffer = this.prepareMessage(msg)
        this._socket.write(dataFrameBuffer)
    }

    private prepareMessage(msg: string) {
        const messageBuffer = Buffer.from(msg)
        const messageSize = messageBuffer.length

        let dataFrameBuffer

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

            target.writeUint16BE(messageSize, 2)
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
}