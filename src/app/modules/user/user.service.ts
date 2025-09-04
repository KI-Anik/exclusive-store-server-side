import AppError from "../../errorHelpers/AppError";
import httpStatus from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload

    const isUserExist = await User.findOne({ email })
    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already exist")
    }

    const hashedPassword = await bcrypt.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

    const authProvider: IAuthProvider = {
        provider: "credentials",
        providerId: email as string
    }

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })
    return user
}

export const UserService ={createUser}