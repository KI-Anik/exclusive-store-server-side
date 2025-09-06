import { Response } from "express"

interface IAuthToken {
    accessToken: string
}

export const setAuthCookie = (res: Response, tokenInfo: IAuthToken) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: false
        })
    }
}