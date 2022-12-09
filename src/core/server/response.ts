import { IncomingMessage, ServerResponse } from "http";
import { ContentType, exts, Exts, Status, status } from "../types";
import { getFile } from "./helper";

type Headers  = {
    contentType: ContentType
} & Status


export class Response {
    private headers: Headers = {
        contentType: 'text/plain',
        statusCode: 200,
        statusMessage: 'Ok'
    }

    constructor (private readonly _res: ServerResponse<IncomingMessage>) {}

    status(statusCode: typeof this.headers.statusCode) {
        this.headers.statusCode = statusCode
        this.headers.statusMessage = status[statusCode]
        return this
    }

    json(data: { [key: string | number | symbol] : any }) {
        this.headers.contentType = 'application/json'
        this.send(JSON.stringify(data))
    }

    send(data: any) {
        const { statusCode, statusMessage, contentType } = this.headers

        this._res.statusCode = statusCode
        this._res.statusMessage = statusMessage

        this._res.setHeader('Content-Type', contentType)
        this._res.setHeader('Status', `${statusCode} ${statusMessage}`)

        if(typeof data !== 'string') data = String(data)
        this._res.write(data)
        this._res.end()
    }

    async sendFile(path: string): Promise<void | true> {
        const buffer = await getFile(path)
        const ext = (path.split('.').splice(-1)[0] || 'default') as Exts
        if(!buffer) return;
        const contentType = exts[ext] || exts['default']
        this.headers.contentType = contentType
        this.send(buffer)
        return true
    }
}