import { IncomingMessage, ServerResponse, createServer } from "http";
import Request from "../request";
import { Response } from "../response";

type NextFunction = (req: Request, res: Response, next: () => void) => void

export class Server {
    private _app;
    private queue: NextFunction[] = []
    private queue_index = -1
    request?: Request
    response?: Response
    constructor(){
        this._app = createServer(async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
            this.request = new Request(req)
            this.response = new Response(res)
            await this.request.json()

            const fn = this.driver(this.request, this.response, this.queue.shift(), this.queue)
            fn()
        })
    }

    private driver (req: Request, res: Response, fn: Function = () => {}, queue: Function[]) {
        return queue.length === 0 ? () => fn(req, res) : () => fn(req, res, this.driver(req, res, queue.shift(), queue))
    }

    public listen(port: number, fn: (port?: number) => void) {
        if(typeof port !== 'number') throw new Error("Port must be integer");
        if(fn && typeof fn !== 'function') throw new Error("Second argument must be function")

        this._app.listen(port)

        if(fn) fn(port)
    }

    public use(path: NextFunction | string, ...fns: NextFunction[]) {
        if(typeof path === 'string' && Array.isArray(fns) &&  fns.every(fn => typeof fn === 'function')) {
            const fn = (req: Request, res: Response, next: () => void) => {
                if(path === req.url) {
                    const fn = this.driver(req, res, fns.shift(), fns)
                    fn()
                } else {
                    if(typeof next === 'function') next()
                }
            }
            this.queue.push(fn)
        } else if(typeof path === 'function') {
            this.queue.push(path, ...fns)
        }
        this.queue_index++
    }
}