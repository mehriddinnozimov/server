import { IncomingMessage, ServerResponse, createServer } from "http";
import { join } from "path";
import { Request, Response, Router } from ".";
import { WS } from "./ws";

export class Server extends Router {
    private _app;

    constructor(){
        super()
        this._app = createServer(async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
            const request = new Request(req)
            const response = new Response(res)
            await request.json()

            for(let i = 0; i <= this.queue.length; i++) {
                if(i === this.queue.length) {
                    response.status(404).send(`Cannot ${request.method} ${request.url}`)
                } else {
                    let fn = this.queue[i]
                    let result = await fn(request, response)
                    if(result === true) break;
                }
            }
        })
    }

    public listen(port: number, fn: (port?: number) => void) {
        if(typeof port !== 'number') throw new Error("Port must be integer");
        if(fn && typeof fn !== 'function') throw new Error("Second argument must be function")

        this._app.listen(port)

        if(fn) fn(port)
    }

    public static(path: string) {
        this.queue.push(async (req, res) => {
            if(!req.url) throw new Error("URL is required")
            if(req.method === 'GET') {
                return await res.sendFile(join(path, req.url))
            }
        })
    }

    public websocket() {
        this.isSocketOn = true
        return new WS(this._app)
    }
}