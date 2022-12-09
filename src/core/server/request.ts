import { IncomingHttpHeaders, IncomingMessage } from "http"
import { stringEvery } from "./helper"
import { ContentType, Method } from "../types"

interface Headers extends IncomingHttpHeaders {
    contentType: ContentType
    contentLength: string
    [key: string | number | symbol]: string | string[] | undefined
}

export class Request {
    body: any = {}
    method?: Method
    file?: {
        filename: string,
        originalname: string,
        size: number,
        buffer: Buffer,
        ext: string
    }
    url?: string
    urlname?: string
    query: { [key: string]: string } = {}
    params: { [key: string]: string } = {}
    headers: Headers = {
        contentType: 'application/json',
        contentLength: '0'
    }

    constructor(private readonly _req: IncomingMessage) {
        this.method = _req.method as Method
        this.urlParser()
    }

    async json() {
        this.headersParser()
        this.queryParser()
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
                if(lines[0].length === 0) lines.shift()
                if(lines[lines.length -1].length === 0) lines.pop()
                for(let index = 0; index < lines.length; index++) {
                    data += index + 1 < lines.length ? `${lines[index]}\n` : lines[index]
                }

                const [ _, nameKey, filenameKey ] = contentDisposition.split(";")
                const name = nameKey.split("=")[1].slice(1, -1)
                if(filenameKey) {
                    const originalname = filenameKey.split("=")[1].slice(1, -1)
                    const filename = originalname.split('.').slice(0, -1).join('')
                    const ext = originalname.split('.').slice(-1)[0]
                    this.file = {
                        filename,
                        originalname,
                        ext,
                        size: data.length,
                        buffer: Buffer.from(data)
                    }
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

    public urlParser(newUrl?: string) {
        this.url = newUrl || this._req.url || '/'
        this.urlname = this.url.split('?')[0]
    }

    public paramsParser(path: `/${string}`) {
        if(!this.url) throw new Error("URL is required")

        const urlPaths = this.url.split('/')
        const paths = path.split('/')
        paths.forEach((path, index) => {
            if(path[0] === ':') {
                this.params[path.slice(1)] = urlPaths[index]
            }
        })
    }

    private queryParser() {
        if(!this.url) throw new Error("URL is required")
        const queries = this.url.split('?')[1]?.split('&')
        queries?.forEach(keyAndValue => {
            const [ key, value ] = keyAndValue.split('=')
            this.query[key] = value
        })
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