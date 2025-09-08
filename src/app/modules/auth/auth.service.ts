import { createUserToken } from './../../utils/userTokens';
import  httpStatus  from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from 'bcryptjs';

const credentialsLogin = async (payload : Partial<IUser>)=>{
    const {email, password} = payload

    const isUserExist = await User.findOne({email})
    if(!isUserExist){
        throw new AppError(httpStatus.NOT_FOUND, "Email doesn't exist")
    }

    const isPasswordMatched = await bcrypt.compare(password!, isUserExist?.password as string)
    if(!isPasswordMatched){
        throw new AppError(httpStatus.FORBIDDEN, "Incorrect password")
    }


     const userTokens = createUserToken(isUserExist)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = isUserExist.toObject()
    //removed password from response/frontend

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    }
}

export const authServices ={
    credentialsLogin
}