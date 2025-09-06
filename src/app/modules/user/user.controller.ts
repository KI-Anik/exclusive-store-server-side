import httpStatus from 'http-status-codes';
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { envVars } from '../../config/env';


const createUser = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await UserService.createUser(
        req.body,
    );

    // Set refresh token in a secure, httpOnly cookie for auto-login
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: envVars.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User registered and logged in successfully',
        data: {
            user,
            accessToken,
        },
    });
})

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id

    const payload = req.body
    const verifiedToken = req.user;

    if (!verifiedToken) {
        throw new Error("Unauthorized: No user token found");
    }

    const user = await UserService.updateUser(userId, payload, verifiedToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User updated successfully",
        data: user
    })
})

const getAllUsers = catchAsync(async(req:Request, res: Response)=>{
    const result = await UserService.getAllUsers(req.query)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All users retrived successfully",
        data: result.data,
        meta: result.meta
    })
})

export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser
}