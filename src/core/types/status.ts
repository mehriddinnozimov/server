export const status = {
    200: 'Ok',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    500: 'Internal Server Error',
    502: 'Service Unavailable'

} as const

interface Ok {
    statusCode: 200
    statusMessage: typeof status[200]
}

interface Created {
    statusCode: 201
    statusMessage: typeof status[201]
}

interface Accepted {
    statusCode: 202
    statusMessage: typeof status[202]
}

interface NonAuthoritativeInformation {
    statusCode: 203
    statusMessage: typeof status[203]
}

interface NoContent {
    statusCode: 204
    statusMessage: typeof status[204]
}

interface BadRequest {
    statusCode: 400
    statusMessage: typeof status[400]
}

interface Unauthorized {
    statusCode: 401
    statusMessage: typeof status[401]
}

interface PaymentRequired {
    statusCode: 402
    statusMessage: typeof status[402]
}

interface Forbidden {
    statusCode: 403
    statusMessage: typeof status[403]
}

interface NotFound {
    statusCode: 404
    statusMessage: typeof status[404]
}

interface MethodNotAllowed {
    statusCode: 405
    statusMessage: typeof status[405]
}

interface RequestTimeout {
    statusCode: 408
    statusMessage: typeof status[408]
}

interface InternalServerError {
    statusCode: 500
    statusMessage: typeof status[500]
}

interface ServiceUnavailable {
    statusCode: 502
    statusMessage: typeof status[502]
}

export type Status =
    Ok | Created | Accepted | NonAuthoritativeInformation | NoContent | 
    BadRequest | Unauthorized | PaymentRequired | Forbidden | NotFound | 
    MethodNotAllowed | RequestTimeout | InternalServerError | ServiceUnavailable