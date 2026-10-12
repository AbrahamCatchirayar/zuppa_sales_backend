import { HttpException, HttpStatus } from '@nestjs/common';

export enum StandardErrorCode {
  STANDARD_NOT_FOUND = 'STANDARD_NOT_FOUND',
  MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
  INDICATOR_NOT_FOUND = 'INDICATOR_NOT_FOUND',
  QUESTION_NOT_FOUND = 'QUESTION_NOT_FOUND',
  INVALID_SEQUENCE = 'INVALID_SEQUENCE',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INVALID_INPUT = 'INVALID_INPUT',
}

export class StandardException extends HttpException {
  constructor(
    message: string,
    public readonly errorCode: StandardErrorCode,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        message,
        errorCode,
        statusCode,
      },
      statusCode,
    );
  }
}
