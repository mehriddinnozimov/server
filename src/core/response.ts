import { IncomingMessage, ServerResponse } from "http";
import { ContentType, Status, status } from "./types";

type Headers  = {
    contentType: ContentType
} & Status


export default class Response {
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
}