import { Response } from "express"

interface IAuthToken {
    accessToken?: string,
    refreshToken?: string
}

export const setAuthCookie = (res: Response, tokenInfo: IAuthToken) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: false
        })
    };

    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: false
        })
    };
}