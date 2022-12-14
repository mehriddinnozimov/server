import * as fs from 'fs/promises'
import { join, parse } from 'path'
import { Model } from './model'
import { Schema, types } from './types'

export class JDB {
    readonly dbname: string
    private readonly dbpath: string
    private collections: { name: string, path: string }[] = []
    private queue: Model[] = []

    constructor(path: string, name: string) {
        this.dbname = name
        this.dbpath = join(path, `${this.dbname}DB`)
    }

    private async driver() {
        try {
            await fs.access(this.dbpath)
            const collectionsdir = await fs.readdir(join(this.dbpath, 'collections'))
            collectionsdir.forEach(filename => {
                const parsingFilename = parse(filename)
                if(parsingFilename.ext === '.json') {
                    this.collections.push({
                        name: parsingFilename.name,
                        path: filename
                    })
                }
            })
            console.log(this.queue)
            this.queue.forEach(model => {
                model.modelpath = `${this.dbpath}/collections/${model.name}.json`
                const isModelExist = this.checkModelIsExist(model.name)
                if(!isModelExist) {
                    this.createFile(model.modelpath, JSON.stringify(model))
                }
            })

        } catch (err) {
            this.create()
            this.driver()
        }
    }

    public async init() {
        await this.driver()
    }

    private async create() {
        this.createFolder(this.dbpath)
        this.createFolder(join(this.dbpath, 'collections'))
    }

    private async createFolder(path: string) {
        await fs.mkdir(path, {
            recursive: true
        })
    }

    private async createFile(path: string, data: string) {
        await fs.writeFile(path, data)
    }

    public async dropAll() {
        await fs.rm(join(this.dbpath, 'collections'), { recursive: true, force: true })
        this.createFolder(join(this.dbpath, 'collections'))
    }

    public checkModelIsExist(name: string) {
        return !!this.collections.find(collection => collection.name === name)
    }

    public async removeModel(name: string) {
        const isModelExist = this.checkModelIsExist(name)
        this.collections = this.collections.filter(model => model.name !== name)
        if(!isModelExist) throw new Error(`Model ${name} is not found`)
        await fs.unlink(join(this.dbpath, 'collections', `${name}.json`))
    }

    public addModel(model: Model) {
        this.queue.push(model)
    }
}

export { types, Schema, Model }