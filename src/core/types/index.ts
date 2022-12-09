export const allowed = {
    method: [ "GET", "POST", "PUT", "PATCH", "DELETE" ],
    contentType: [ 'application/json', 'application/javascript', 'text/plain', 'text/html', 'multipart/form-data' ],
} as const

export const exts = {
    'json': allowed.contentType[0],
    'js': allowed.contentType[1],
    'txt': allowed.contentType[2],
    'html': allowed.contentType[3],
    'default':  allowed.contentType[2],
} as const

export type Exts = keyof typeof exts

export type Method = typeof allowed.method[number]
export type ContentType = typeof allowed.contentType[number]
export { Status, status } from './status'