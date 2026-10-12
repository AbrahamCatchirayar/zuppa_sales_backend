/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isArray } from 'class-validator';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    console.info(exception.response, 'responseresponseresponseresponse');

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.info(exception);
    if (status === 401) {
      response.status(status).json({
        success: false,
        error: ['Unauthorized'],
      });
    }

    if (status === 422) {
      const error = exception.response.message || exception.response;

      response.status(status).json({
        success: false,
        error: isArray(error) ? error : [error],
      });
    }

    if (status === 500) {
      response.status(status).json({
        success: false,
        error: ['Internal Server Error'],
      });
    }

    if (status === 504) {
      response.status(status).json({
        success: false,
        error: ['Too many requests'],
      });
    }

    if (status === 400) {
      const error = exception.response.message || exception.response;

      let errorinfo;
      if (error === 'duplicates') {
        errorinfo = exception.response.response.error;
      }
      response.status(status).json({
        success: false,
        error: isArray(error) ? error : [error],
        message: errorinfo,
      });
    }

    if (status === 403) {
      const error = exception.response.message || exception.response;

      response.status(status).json({
        success: false,
        error: isArray(error) ? error : [error],
      });
    }

    if (status === 404) {
      const error = exception.response.message || exception.response;

      response.status(status).json({
        success: false,
        error: isArray(error) ? error : [error],
      });
    }

    if (status === 429) {
      const error = exception.response.message || exception.response;
      response.status(status).json({
        success: false,
        error: isArray(error) ? error : [error],
      });
    }
  }
}
