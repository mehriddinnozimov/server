export const types = {
    UID: 'uid',
    NUMBER: 'number',
    CHAR: 'char',
    BOOLEAN: 'boolean',
    TEXT: 'text',
    ARRAY: 'array',
    INTEGER: 'integer'
} as const

export type Types = keyof typeof types

export interface Schema {
    [key: string | number | symbol]: typeof types[Types] | {
        type: typeof types.NUMBER | typeof types.INTEGER
        autoIncrement?:  'ASC' | 'DESC'
        min?: number
        max?: number
        allowNull?: boolean
        defaultValue?: number
        validate?: (value: number) => boolean | Promise<boolean>
    } | {
        type: typeof types.CHAR | typeof types.TEXT
        minLength?: number
        maxLength?: number
        allowNull?: boolean
        defaultValue?: string
        validate?: (value: string) => boolean | Promise<boolean>
    } | {
        type: typeof types.UID
        autoIncrement?:  'ASC' | 'DESC'
        validate?: (value: number) => boolean | Promise<boolean>
    } | {
        type: typeof types.ARRAY
        minLength?: number
        maxLength?: number
        allowNull?: boolean
        items?: Types[]
        validate?: (value: Array<any>) => boolean | Promise<boolean>
    } | {
        type: typeof types.BOOLEAN
        allowNull?: boolean
        defaultValue?: boolean
        validate?: (value: boolean) => boolean | Promise<boolean>
    }
}

export type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;