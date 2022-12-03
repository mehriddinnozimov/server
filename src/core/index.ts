import { IncomingMessage, ServerResponse, createServer } from "http";
import Request from "./request";
import { Response } from "./response";

type NextFunction = (req: Request, res: Response, next?: NextFunction) => void

export class Server {
    private app;
    private queue: NextFunction[] = []
    private temp_queue: NextFunction[] = []

    constructor(){
        this.app = createServer(async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
            this.temp_queue = [...this.queue]
            const request = new Request(req)
            const response = new Response(res)
            await request.json()

            const fn = this.driver(request, response, this.temp_queue.shift())
            fn()
        })
    }

    private driver (req: Request, res: Response, fn: Function = () => {}) {
        return this.temp_queue.length == 0 ? () => fn(req, res) : () => fn(req, res, this.driver(req, res, this.temp_queue.shift()))
        
    }

    public listen(port: number, fn: (port?: number) => void) {
        if(typeof port !== 'number') throw new Error("Port must be integer");
        if(fn && typeof fn !== 'function') throw new Error("Second argument must be function")

        this.app.listen(port)

        if(fn) fn(port)
    }

    public use(...fns: NextFunction[]) {
        this.queue = [...this.queue, ...fns]
    }
}