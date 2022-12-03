export const allowed = {
    method: [ "GET", "POST", "PUT", "PATCH", "DELETE" ],
    contentType: [ 'application/json', 'application/javascript', 'text/plain', 'text/html', 'multipart/form-data' ],
} as const

export type Method = typeof allowed.method[number]
export type ContentType = typeof allowed.contentType[number]
export { Status, status } from './status'