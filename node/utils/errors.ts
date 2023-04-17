export enum ErrorType {
  UnexpectedError = 'unexpected_error'
}

export class Error {
  code: ErrorType
  message: string
  innerError: any

  constructor(code: ErrorType, message?: string, innerError?: any) {
    this.code = code
    this.message = message ?? `an error occurred: ${code}`
    this.innerError = innerError
  }
}