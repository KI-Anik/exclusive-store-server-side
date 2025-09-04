import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export const genetateToken = (payload: JwtPayload, secret: string, expiresIn: string) => {
    const token = jwt.sign(payload, secret, {
        expiresIn
    } as SignOptions)
    return token
}

