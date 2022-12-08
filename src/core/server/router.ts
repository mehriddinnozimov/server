import { Request, Response } from ".";

type ServerFunction = (req: Request, res: Response) => void | true | Promise<true | void>
type Path = `/${string}` | '*'

export class Router {
    public readonly queue: ServerFunction[] = []

    constructor() {}

    private checkUrl(path: Path, url?: string | null) {
        if(!url) return null
        if(path === '*') return url

        const paths = path.split('/')
        const urlPaths = url.split('/')

        return paths.every((path, index) => {
            const p = urlPaths.shift()
            return path.startsWith(":") || path === p
        }) ? `/${urlPaths.join('/')}` : null
    }

    public get(path: Path, fn: ServerFunction) {
        this.queue.push((req: Request, res: Response) => {
            if(path !== '*') req.paramsParser(path);
            if(req.method === 'GET' && this.checkUrl(path, req.urlParsed?.pathname)) {
                fn(req, res)
                return true
            }
        })
    }

    public post(path: Path, fn: ServerFunction) {
        this.queue.push((req: Request, res: Response) => {
            if(path !== '*') req.paramsParser(path);
            if(req.method === 'POST' && this.checkUrl( path, req.urlParsed?.pathname)) {
                fn(req, res)
                return true
            }
        })
    }

    public put(path: Path, fn: ServerFunction) {
        this.queue.push((req: Request, res: Response) => {
            if(path !== '*') req.paramsParser(path);
            if(req.method === 'PUT' && this.checkUrl(path, req.urlParsed?.pathname)) {
                fn(req, res)
                return true
            }
        })
    }

    public patch(path: Path, fn: ServerFunction) {
        this.queue.push((req: Request, res: Response) => {
            if(path !== '*') req.paramsParser(path);
            if(req.method === 'PATCH' && this.checkUrl(path, req.urlParsed?.pathname)) {
                fn(req, res)
                return true
            }
        })
    }

    public delete(path: Path, fn: ServerFunction) {
        this.queue.push((req: Request, res: Response) => {
            if(path !== '*') req.paramsParser(path);
            if(req.method === 'DELETE' && this.checkUrl(path, req.urlParsed?.pathname)) {
                fn(req, res)
                return true
            }
        })
    }

    public use(path: Path | ServerFunction, fn?: ServerFunction | Router) {
        if(typeof path === 'string') {
            this.queue.push(async (req: Request, res: Response) => {
                if(path !== '*') req.paramsParser(path);
                const newUrl = this.checkUrl(path, req.urlParsed?.pathname)
                
                if(typeof newUrl === 'string') {
                    if(typeof fn === 'function') {
                        return fn(req, res)
                    } else
                    if(fn instanceof Router) {
                        req.urlParser(newUrl)

                        const fns = fn
                        for(let fn of fns.queue) {
                            const result = await fn(req, res)
                            if(result) return result
                        }
                    }
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