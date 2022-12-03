import { IncomingHttpHeaders, IncomingMessage } from "http"
import { stringEvery } from "./helper"
import { ContentType, Method } from "./types"

interface Headers extends IncomingHttpHeaders {
    contentType: ContentType
    contentLength: string
    [key: string | number | symbol]: string | string[] | undefined
}

export default class Request {
    body: any = {}
    method?: Method
    file?: Buffer
    headers: Headers = {
        contentType: 'application/json',
        contentLength: '0'
    }

    constructor(private readonly _req: IncomingMessage) {
        this.method = _req.method as Method
    }

    async json() {
        this.headersParser()
        await this.bodyParser()
    }

    private async collectData () {
        this._req.setEncoding('utf-8')
        let data = ''
        for await (let chunk of this._req) {
            data += chunk
        }

        return data
    }

    private parseJSON(data: string) {
        this.body = JSON.parse(data)
    }

    private parseText(data: string) {
        this.body = data
    }

    private parseJavascript(data: string) {
        this.body = function() { return eval(data) }
    }

    private parseFormData(data: string) {
        const boundary = this.headers.contentType.split('=')[1]

        //rasvo xato
        const parts = data.split(`--${boundary}`)

        for(let part of parts) {
            const checkPart = part.trim()
            if(checkPart.length !== 0 && !stringEvery(checkPart, checkPart[0])) {
                let lines = part.split(/\r?\n/)
                let contentDisposition = ''
                let contentType = ''

                const contentDispositionIndex = lines.findIndex(line => line.startsWith('Content-Disposition'))
                const contentTypeIndex = lines.findIndex(line => line.startsWith('Content-Type'))

                if(contentDispositionIndex > -1) {
                    contentDisposition = lines[contentDispositionIndex]
                }
                if(contentTypeIndex > -1) {
                    contentType = lines[contentTypeIndex]
                }
                lines = lines.filter((line, index) =>  index !== contentTypeIndex && index !== contentDispositionIndex).slice(1, -1)

                let data = ''
                if(lines.length > 1) {
                    for(let line of lines) {
                        data += `${line}\n`
                    }
                }
                const [ _, nameKey, filenameKey ] = contentDisposition.split(";")
                const name = nameKey.split("=")[1].slice(1, -1)
                if(filenameKey) {
                    const buffer = Buffer.from(data)
                    const file = {
                        filename: filenameKey.split("=")[1].slice(1, -1),
                        size: data.length,
                        data
                    }
                    this.file = buffer
                    this.body[name] = file
                } else {
                    this.body[name] = data
                }
            }
        }
    }

    private headersParser() {
        Object.assign(this.headers, this._req.headers)
        this.headers.contentType = this._req.headers['content-type'] as ContentType || 'application/json'
        this.headers.contentLength = this._req.headers['content-length'] || '0'
    }

    private async bodyParser() {
        const { headers, method } = this
        const { contentType } = headers
        if(contentType.length === 0) return;


        if(!method || method === 'GET') return;


        const data = await this.collectData()

        if(contentType === 'application/json') {
            this.parseJSON(data)
        } else
        if(contentType === 'text/plain') {
            this.parseText(data)
        } else
        if(contentType.startsWith('multipart/form-data')) {
            this.parseFormData(data)
        } else 
        if(contentType === 'application/javascript') {
            this.parseJavascript(data)
        } else
        if(contentType === 'text/html') {
            this.parseText(data)
        }


        else {
            throw new Error("Unespected content-type")
        }
    }
}