import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { ApiErrorResponse } from '@campuspulse/types';

/**
 * Standardized HTTP Exception Filter.
 *
 * Catches all HttpExceptions and uncaught errors, transforming them into
 * the unified ApiErrorResponse contract shared with web and mobile clients.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';
    let errors: Record<string, string[]> | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const responseObj = res as Record<string, any>;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;

        // Handle class-validator validation error arrays
        if (Array.isArray(responseObj.message)) {
          message = 'Validation failed';
          errors = {
            validation: responseObj.message,
          };
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    } else {
      this.logger.error('Unknown exception caught', JSON.stringify(exception));
    }

    const errorPayload: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      error,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorPayload);
  }
}
