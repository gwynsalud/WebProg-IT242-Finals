import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Determine the status code
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get the error message
    const message = 
      exception instanceof HttpException 
        ? exception.getResponse() 
        : 'The Ancient Scrolls are unreadable (Internal Server Error)';

    // Log the error for you to see in Vercel logs
    console.error('--- BACKEND ERROR ---');
    console.error(exception);

    // Send the "RPG Style" response to the frontend
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: typeof message === 'string' ? message : (message as any).message,
      error_type: 'CRITICAL_MISS',
      hint: 'Check your connection to the Great Database (Supabase)'
    });
  }
}