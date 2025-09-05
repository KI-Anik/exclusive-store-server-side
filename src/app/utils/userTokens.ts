import httpStatus from 'http-status-codes';
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { IsActive, IUser } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import { User } from '../modules/user/user.model';
import { JwtPayload } from 'jsonwebtoken';

export const createUserToken = (user: Partial<IUser>) => {
    const jwtpayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };

    const accessToken = generateToken(
        jwtpayload,
        envVars.JWT_ACCESS_SECRET,
        envVars.JWT_ACCESS_EXPIRES
    );

   const refreshToken = generateToken(
        jwtpayload,
        envVars.JWT_REFRESH_SECRET,
        envVars.JWT_REFRESH_EXPIRES
    )

    return {
        accessToken,
        refreshToken
    }
};

export const createNewAccessTokenWithRefreshToken = async (refreshToken : string) =>{
     const verifiedToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload

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

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    return accessToken
};