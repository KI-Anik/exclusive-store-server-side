import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError"
import { ZodError } from "zod"

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const globalErrorHandler =(err : any, req : Request, res : Response, next : NextFunction)=>{

    let statusCode = 500;
    let message= 'something went wrong , from global error';
    let errorMessage = ''

    if(err instanceof AppError){
        statusCode = err.statusCode
        message = err.message
    } else if (err instanceof ZodError) {
        statusCode = 400;
        message = "Validation Error";
        errorMessage = err.issues.map(issue => `${issue.path.join('.')} is ${issue.message}`).join('.');
    }else if(err instanceof Error){
        statusCode = 500
        message= err.message
    }


    res.status(statusCode).json({
        success: false,
        message,
        errorMessage: errorMessage || undefined,
        err,
    })
} 