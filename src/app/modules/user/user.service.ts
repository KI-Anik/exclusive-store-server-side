import AppError from "../../errorHelpers/AppError";
import httpStatus from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import { sendWelcomeEmail } from "../../nodemailer/sendWelcomeEmail";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, name, ...rest } = payload

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
        name,
        auths: [authProvider],
        ...rest
    })

    if (user.email && user.name) {
        // We don't want to block the response if the email fails to send.
        // Log the error for debugging, but let the user registration succeed.
        sendWelcomeEmail(user.email, user.name)
            .catch(err => console.error(`Failed to send welcome email to ${user.email}`, err));
    }

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