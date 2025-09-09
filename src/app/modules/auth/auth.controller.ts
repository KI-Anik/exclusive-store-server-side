/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";
import AppError from '../../errorHelpers/AppError';

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body)

    setAuthCookie(res, loginInfo)

    sendResponse(res, {
        statusCode: httpStatus.ACCEPTED,
        success: true,
        message: 'Login successful',
        data: loginInfo
    })
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "NO refresh token received from cookies")
    }

    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken)

    setAuthCookie(res, tokenInfo) // storing token in browser cookies

    sendResponse(res, {
        statusCode: httpStatus.ACCEPTED,
        success: true,
        message: 'new access token created',
        data: tokenInfo
    })
});

const logOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "successfully logged out",
        data: null
    })
});

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logOut
};