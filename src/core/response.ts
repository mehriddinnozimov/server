import { IncomingMessage, ServerResponse } from "http";

export class Response {
    private headers: {
        contentType: 'application/json' | 'text/plain' | 'text/html' | 'application/javascript'
        statusCode: number
        statusMessage: 'Not Found' | 'Ok'
    } = {
        contentType: 'text/plain',
        statusCode: 200,
        statusMessage: 'Ok'
    }

    constructor (private readonly _res: ServerResponse<IncomingMessage>) {
        
    }

    status(statusCode: number) {
        const { headers } = this
        this.headers.statusCode = statusCode
        switch (statusCode) {
            case 200:
                headers.statusMessage = 'Ok'
            case 404:
                headers.statusMessage = 'Not Found'
        }
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
        this._res.end(data)
    }
}