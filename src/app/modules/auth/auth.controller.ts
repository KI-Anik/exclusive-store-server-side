import httpStatus from 'http-status-codes';
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authServices } from "./auth.service";
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";

const credentialsLogin = catchAsync(async (req: Request, res: Response) => {
    const loginInfo = await authServices.credentialsLogin(req.body)

    setAuthCookie(res, loginInfo)

    sendResponse(res, {
        statusCode: httpStatus.ACCEPTED,
        success: true,
        message: 'Login successful',
        data: loginInfo
    })
})

export const authControllers = {
    credentialsLogin
}