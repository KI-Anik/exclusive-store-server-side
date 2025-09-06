"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const zod_1 = require("zod");
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'global error handler - something went wrong!!';
    let errorMessage = '';
    if (err instanceof AppError_1.default) {
        statusCode = err.statusCode,
            message = err.message;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400,
            message = 'validation error',
            errorMessage = err.issues.map(issue => `${issue.path.join('.')} is ${issue.message}`).join('.');
    }
    else if (err instanceof Error) {
        statusCode = 500,
            message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorMessage: errorMessage || undefined,
        // It's not recommended to send the full error object in production
        // as it can leak sensitive information.
        // err
    });
};
exports.default = globalErrorHandler;
