import { IncomingMessage, ServerResponse, createServer } from "http";
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

            for(let fn of this.queue) {
                const result = await fn(request, response)
                if(result === true) break;
            }
        })
    }

    public listen(port: number, fn: (port?: number) => void) {
        if(typeof port !== 'number') throw new Error("Port must be integer");
        if(fn && typeof fn !== 'function') throw new Error("Second argument must be function")

        this._app.listen(port)

        if(fn) fn(port)
    }

    public websocket() {
        const ws = new WS(this._app)
        
    }
}