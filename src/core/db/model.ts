import * as fs from 'fs/promises'
import { NonFunctionProperties, Schema } from "./types";

interface FindOptions {
    where?: {
        [key: string | symbol | number]: any
    },
    attributes?: string[]
}

export class Model {
    readonly name: string
    readonly _schema: Schema
    data: any[]
    modelpath?: string
    constructor(name: string, schema: Schema) {
        this.name = name
        this._schema = schema
        this.data = []
    }

    public validate(data: any) {
        let checkType = (type: string, value: any, key: string, strict: boolean) => {
            switch(type) {
                case 'uid':
                    if(value) throw new Error("You dont have a permission modifiying UID types");
                    data[key] = this.data.length + 1
                    break;
                case 'text':
                    if(typeof value === 'undefined' && !strict) throw new Error(`${key} is required`)
                    if(typeof value !== 'string' && !strict) throw new Error(`${key} must be TEXT`)
                    break;
                case 'char':
                    if(typeof value === 'undefined' && !strict) throw new Error(`${key} is required`)
                    if(typeof value !== 'string' && !strict) throw new Error(`${key} must be CHAR`)
                    if(value.length > 255) throw new Error(`${key} length must be less than 255`)
                    break;
                case 'number':
                    if(typeof value === 'undefined' && !strict) throw new Error(`${key} is required`)
                    if(typeof value !== 'number' && !strict) throw new Error(`${key} must be NUMBER`)
                    break;
                case 'integer':
                    if(typeof value === 'undefined' && !strict) throw new Error(`${key} is required`)
                    if(typeof value !== 'number' && !strict) throw new Error(`${key} must be INTEGER`)
                    if(value < 1) throw new Error(`${key} must be greaten than 0`)
                    break;
                case 'array':
                    if(typeof value  === 'undefined') throw new Error(`${key} is required`)
                    if(!Array.isArray(value)) throw new Error(`${key} must be ARRAY`)
                    break;
                case 'boolean':
                    if(typeof value  === 'undefined' && !strict) throw new Error(`${key} is required`)
                    if(typeof value !== 'boolean' && !strict) throw new Error(`${key} must be BOOLEAN`)
                    break;
            }
        }
        const schemaKeys = Object.keys(this._schema)
        schemaKeys.forEach(key => {
            const type = this._schema[key]
            if(typeof type === 'string') {
                checkType(type, data[key], key, true)
            } else {
                const typeKeys = Object.keys(type)
                typeKeys.forEach(typeKey => {
                    if(typeKey === 'type') {
                        checkType(type[typeKey], data[key], key, typeof type['defaultValue'] !== 'undefined')
                    } else
                    if (typeKey === 'defaultValue') {
                        if(!data[key]) data[key] = type['defaultValue']
                    } else
                    if(typeKey === 'autoIncrement') {
                        if(type['type'] !== 'integer' && type['type'] !== 'number') throw new Error(`${type['type']} doesn't support autoIncrement`)
                        const lastNumber = this.data.length > 0 ? this.data[this.data.length - 1][key] : type['defaultValue'] > 0 ? type['defaultValue'] - 1 : type['defaultValue'] + 1

                        data[key] = lastNumber + (type['autoIncrement'] === 'ASC' ? 1 : -1)
                    } else {

                    }
                })
            }
        })
    }

    private async readData() {
        if(!this.modelpath) throw new Error("Modelpath is required")
        const modelBuffer = await fs.readFile(this.modelpath)
        const model = JSON.parse(modelBuffer.toString()) as NonFunctionProperties<Model>
        this.data = model.data
        return model
    }

    private async writeData() {
        if(!this.modelpath) throw new Error("Modelpath is required")

        await fs.writeFile(this.modelpath, JSON.stringify(this))
    }

    public async find(findOptions?: FindOptions) {
        await this.readData()
        let data = this.data
        if(findOptions) {
            const { where, attributes } = findOptions
            if(where) {
                const filtered = []
                const findKeys = Object.keys(findOptions.where)
                data.forEach(d => {
                    for(let findKey of findKeys) {
                        const result = d[findKey] === findOptions.where[findKey]
                        if(result) {
                            if(attributes) {
                                const n = {}
                                for(let attribute of attributes) {
                                    if(!d[attribute]) throw new Error(`Attribute ${attribute} is not valid`)
                                    n[attribute] = d[attribute] 
                                }
                                filtered.push(n)
                            } else {
                                filtered.push(d)
                            }
                        }
                    }
                })
                data = filtered
            } else {
                if(attributes) {
                    data = data.map(d => {
                        const n = {}
                        for(let attribute of attributes) {
                            if(!d[attribute]) throw new Error(`Attribute ${attribute} is not valid`)
                            n[attribute] = d[attribute] 
                        }
                        return n
                    })
                }
            }
        }
        return data
    }

    public async create(data: any) {
        await this.readData()
        this.validate(data)
        this.data.push(data)
        await this.writeData()
    }
}