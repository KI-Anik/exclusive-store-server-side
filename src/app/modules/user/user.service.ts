import AppError from "../../errorHelpers/AppError";
import httpStatus from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import { sendWelcomeEmail } from "../../nodemailer/sendWelcomeEmail";

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

    // nodemailer 
     if (user.email && user.name) {
        sendWelcomeEmail(user.email, user.name)
            .catch(err => console.error(`Failed to send welcome email to ${user.email}`, err));
    }

    /***
     * REGISTER USER GET LOGIN AUTOMATICALLY
     * 
     *   const userTokens = createUserToken(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user.toObject();

    return {
        ...userTokens,
        user: userWithoutPassword,
    };
     */

    return user
}

const getAllUsers = async () => {
    const users = await User.find({})
    const totalUsers = await User.countDocuments()
    return {
        meta: {
            total: totalUsers
        },
        data: users,
    }
}

export const UserService = {
    createUser,
    getAllUsers
}