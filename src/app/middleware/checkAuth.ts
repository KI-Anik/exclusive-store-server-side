
import { NextFunction, Request, Response } from "express";
import { verifyToken } from '../utils/jwt';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/AppError';
import httpStatus from 'http-status-codes';
import { User } from "../modules/user/user.model";
import { JwtPayload } from "jsonwebtoken";
import { IsActive } from "../modules/user/user.interface";

// Functional Hierarchy
export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization

        if (!accessToken) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!")
        }

        {/* const verifiedToken = jwt.verify(accessToken, 'secret')
        *token verify function from  utils/jwt */ }
        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload

        const isUserExist = await User.findOne({ email: verifiedToken.email })
        if (!isUserExist) {
            throw new AppError(httpStatus.NOT_FOUND, "User does not exist")
        }

        if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
        }

        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
        }

        if (typeof verifiedToken === 'string' || !verifiedToken.role) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Invalid access token");
        }

        {/**(verifiedToken as JwtPayload).role !== Role.ADMIN)
        ** checking for admin Or not*/}
        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to perform this action.")
        }

        req.user = verifiedToken
        next()

    } catch (error) {
        console.log('jwt error', error);
        next(error);

    }

}
