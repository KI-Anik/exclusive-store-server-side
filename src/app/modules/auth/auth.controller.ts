import httpStatus from 'http-status-codes';
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import AppError from '../../errorHelpers/AppError';
import { envVars } from '../../config/env';

const credentialsLogin = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await AuthServices.credentialsLogin(req.body);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: envVars.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User logged in successfully',
        data: {
            user,
            accessToken,
        },
    })
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "NO refresh token received from cookies")
    }

    const { accessToken } = await AuthServices.getNewAccessToken(refreshToken)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'new access token created',
        data: { accessToken }
    })
})

const logOut = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: envVars.NODE_ENV === 'production',
        sameSite: 'strict',
    })

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "successfully logged out",
        data: null
    })
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword
    const decodedToken = req.user

    if (!decodedToken) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized: No user token found");
    }

    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password changed",
        data: null
    })
});

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logOut,
    resetPassword
}