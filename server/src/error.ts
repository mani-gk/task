import { flatten, uniq } from 'lodash'
/**
 * Our own class of error. Helps us accumulate error in stack.
 * Can be used to persist errors and then send it over the network to our servers
 */
export interface CustomError extends CustomErrorSerModel { }

export class CustomError extends Error implements CustomErrorSerModel {
    originalMessage: string
    constructor(message: string, errorCode: CustomErrorCode) {
        super(message + ". Code: " + errorCode)
        this.originalMessage = message
        this.errorCodes = [errorCode]
        this.name = this.constructor.name

        //Taken from
        //http://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(this.message).stack
        }
    }


    static concatMessage(message: string, prevError?: PrevErrorType): string {
        if (typeof message != 'string') {
            message = JSON.stringify(message)
        }
        if (prevError) {
            message = [message, prevError.message].filter(msg => msg).join(";\n")
        }
        return message
    }

    static unionErrorCodes(errorCodes: CustomErrorCode | CustomErrorCode[], prevError?: PrevErrorType): Set<CustomErrorCode> {
        let codes = new Set<CustomErrorCode>()

        if (errorCodes instanceof Array) {
            errorCodes.forEach(codes.add.bind(codes))
        } else {
            codes.add(errorCodes)
        }

        if (prevError && prevError instanceof CustomError) {
            prevError.errorCodes.forEach(codes.add.bind(codes))
        }
        return codes
    }

    setHttpStatus = (code: number): CustomError => {
        this.httpStatus = code
        return this
    }

    toPlainObj(): CustomErrorSerModel {
        return {
            message: this.message,
            errorCodes: this.errorCodes,
            stack: this.stack,
            httpStatus: this.httpStatus
        }
    }

    static fromObj(err: string | Error | CustomError | CustomErrorSerModel | undefined): CustomError {
        let defaultCode: CustomErrorCode = "UNCLASSIFIED"
        if (typeof err == 'string') {
            return new CustomError(err, defaultCode)
        } else if (err instanceof CustomError) {
            return err
        } else if (err instanceof Error) {
            return new CustomError(JSON.stringify(err), defaultCode)
        } else {
            let newE = new CustomError(messageWithoutCode(JSON.stringify(err)), defaultCode)
            newE.httpStatus = err && err.httpStatus
            newE.stack = err && err.stack
            return newE
        }
    }

    toString(): string {
        let message = this.message.trim() + (this.httpStatus ? (". HttpStatus: " + this.httpStatus) : "")
        return ["Error: " + message, this.errorCodes.join(", ")].join("\n\t")
    }
}

const messageWithoutCode = (message: string): string => {
    const index = message.indexOf(". Code:")
    return index != -1 ? message.substr(0, index) : message
}

export interface CustomErrorSerModel {
    message: string,
    errorCodes: CustomErrorCode[],
    stack?: string,
    httpStatus?: number
}

export const showAlert = (message: string) => alert(message)

export type PrevErrorType = Error | CustomError

export type CustomErrorCode = "NOT_FOUND" |
    "UNKNOWN_ERROR" |
    "UNAUTHORIZED" |
    "FORBIDDEN" |
    "UNCLASSIFIED" |
    "INVALID_PARAMS" |
    "MISSING_DATA" |
    "INVALID_DATA" |
    "MISSING_PARAMS" |
    "UNSUPPORTED_ARGUMENTS" |
    "INVALID_ARGUMENTS"

const is400 = (gErr: CustomError) => gErr.errorCodes.length > 0
const is401 = (gErr: CustomError) => gErr.errorCodes.indexOf("UNAUTHORIZED") != -1
const is403 = (gErr: CustomError) => gErr.errorCodes.indexOf("FORBIDDEN") != -1

export const getHttpStatus = (gErr: CustomError) => {
    if (is401(gErr)) { return 401 }
    else if (is403(gErr)) { return 403 }
    else if (gErr.httpStatus) { return gErr.httpStatus }
    else if (is400(gErr)) { return 400 }
    else { return 500 }
}
