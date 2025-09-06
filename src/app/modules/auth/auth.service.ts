import { createUserToken } from './../../utils/userTokens';
import  httpStatus  from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from 'bcryptjs';

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
    }
}

export const authServices ={
    credentialsLogin
}