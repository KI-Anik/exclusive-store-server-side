import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/AppError';
import { Role } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import { catchAsync } from '../utils/catchAsync';
import { verifyToken } from '../utils/jwt';

export const checkAuth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token, envVars.JWT_ACCESS_SECRET) as JwtPayload;

      // Attach decoded user info to the request object
      req.user = decoded;

      // Role-based authorization check
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to perform this action');
      }

      next();
    } catch (error) {
      // Catch JWT errors (e.g., TokenExpiredError) and translate to a 401.
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
    }
  });
};