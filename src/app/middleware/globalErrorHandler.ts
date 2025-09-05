import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { ZodError } from "zod";

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode = 500;
    let message = 'global error handler - something went wrong!!';
    let errorMessage = '';

    if (err instanceof AppError) {
        statusCode = err.statusCode,
            message = err.message
    } else if (err instanceof ZodError) {
        statusCode = 400,
            message = 'validation error',
            errorMessage = err.issues.map(issue => `${issue.path.join('.')} is ${issue.message}`).join('.')
    } else if (err instanceof Error) {
        statusCode = 500,
            message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorMessage: errorMessage || undefined,
        // It's not recommended to send the full error object in production
        // as it can leak sensitive information.
        // err
    })
}

export default globalErrorHandler