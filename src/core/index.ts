import { IncomingMessage, ServerResponse, createServer } from "http";
import Request from "./request";
import Response from "./response";

type ServerFunction = (req: Request, res: Response) => void | Promise<void> | true

export class Server {
    private _app;
    queue: ServerFunction[] = []
    constructor(){
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

    public get(path: string, fn: ServerFunction) {
        this.queue.push((req: Request, res: Response) => {
            if(req.method === 'GET' && req.url === path) {
                fn(req, res)
                return true
            }
        })
    }

    public post(path: string, fn: ServerFunction) {
        this.queue.push((req: Request, res: Response) => {
            if(req.method === 'POST' && (path === '*' ||req.url === path)) {
                fn(req, res)
                return true
            }
        })
    }

    public put(path: string, fn: ServerFunction) {
        this.queue.push((req: Request, res: Response) => {
            if(req.method === 'PUT' && (path === '*' ||req.url === path)) {
                fn(req, res)
                return true
            }
        })
    }

    public patch(path: string, fn: ServerFunction) {
        this.queue.push((req: Request, res: Response) => {
            if(req.method === 'PATCH' && (path === '*' ||req.url === path)) {
                fn(req, res)
                return true
            }
        })
    }

    public delete(path: string, fn: ServerFunction) {
        this.queue.push((req: Request, res: Response) => {
            if(req.method === 'DELETE' && (path === '*' ||req.url === path)) {
                fn(req, res)
                return true
            }
        })
    }

    public use(path: string | ServerFunction, fn?: ServerFunction) {
        if(typeof path === 'string' && typeof fn === 'function') {
            this.queue.push((req: Request, res: Response) => {
                if(path === '*' || req.url === path) {
                    fn(req, res)
                    return true
                }
            })
        } else 
        if(typeof path === 'function') {
            this.queue.push((req: Request, res: Response) => {
                    path(req, res)
            })
        }
    }
}