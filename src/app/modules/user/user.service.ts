import AppError from "../../errorHelpers/AppError";
import httpStatus from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import { sendWelcomeEmail } from "../../nodemailer/sendWelcomeEmail";
import { JwtPayload } from "jsonwebtoken";
import { createUserToken } from "../../utils/userTokens";

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

    // Generate tokens for auto-login
    const userTokens = createUserToken(user);

    // Ensure the password is not sent in the response
    const userObject = user.toObject();
    delete userObject.password;

    return {
        user: userObject,
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
    };
}

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    const isUserExist = await User.findById(userId)
    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "user not found")
    }

    // Conditionals for role-based authorization
    if (payload.role) {
        if (decodedToken.role === Role.USER) {
            throw new AppError(httpStatus.FORBIDDEN, "you are not authorized")
        }

        {/**
    decodedToken = info about the signed-in user (who is making the request);
    payload = info you want to update for another user
     */}

        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "you are not permitted")
        }
    }

    // Authorization for sensitive fields
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === Role.USER) {
            throw new AppError(httpStatus.FORBIDDEN, "you are not authorized")
        }
    }

    // Hash password if it's being updated
    if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND))
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })
    return newUpdatedUser
}

const getAllUsers = async (query: Record<string, unknown>) => {
    const { page = 1, limit = 10 } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const usersQuery = User.find({}).sort('-createdAt').skip(skip).limit(Number(limit));

    const data = await usersQuery.exec();
    const total = await User.countDocuments();

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
        },
        data,
    }
}

export const UserService = {
    createUser,
    getAllUsers,
    updateUser
}