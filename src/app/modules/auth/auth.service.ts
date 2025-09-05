import { createNewAccessTokenWithRefreshToken, createUserToken } from './../../utils/userTokens';
import  httpStatus  from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from 'bcryptjs';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';

const credentialsLogin = async (payload : Partial<IUser>)=>{
    const {email, password} = payload

    // Explicitly select the password field, which is excluded by default
    const isUserExist = await User.findOne({email}).select('+password')
    if(!isUserExist){
        throw new AppError(httpStatus.NOT_FOUND, "Email doesn't exist")
    }

    if (!isUserExist.password) {
        // handles users that were created without a password (e.g. social login)
        throw new AppError(httpStatus.FORBIDDEN, "DB - password not found")
    }

    const isPasswordMatched = await bcrypt.compare(password!, isUserExist.password)
    if(!isPasswordMatched){
        throw new AppError(httpStatus.FORBIDDEN, "Incorrect password")
    }

    const userTokens = createUserToken(isUserExist)

    return {
        accessToken : userTokens.accessToken,
         refreshToken: userTokens.refreshToken,
    }
};

const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken,
        
    }
}

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
    // Select the password field, which is excluded by default in the schema
    const user = await User.findById(decodedToken.userId).select('+password');

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!user.password) {
        // handles users that were created without a password (e.g. social login)
        throw new AppError(httpStatus.BAD_REQUEST, "Password not set for this account. Cannot reset password.");
    }

    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) throw new AppError(httpStatus.UNAUTHORIZED, "Old password doesn't match");

    if (oldPassword === newPassword) throw new AppError(httpStatus.CONFLICT, "New password cannot be the same as the old password");

    user.password = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));
    await user.save();
}

export const AuthServices ={
    credentialsLogin,
    getNewAccessToken,
    resetPassword
}