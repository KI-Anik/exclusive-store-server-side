import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import { catchAsync } from "../utils/catchAsync";

// export const validateRequest = (ZodSchema: AnyZodObject) => async (req: Request, res:Response, next: NextFunction) => {
//     try {
//         req.body = await ZodSchema.parseAsync(req.body)
//         console.log('vaidateRequest req.body', req.body);
//         next()
//     } catch (error) {
//         next(error)
//     }
// }

 const validateRequest = (schema: AnyZodObject)=>{
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction)=>{
            await schema.parseAsync({
                body: req.body,
                cookies: req.cookies
            });
            return next()
        }
    )
}

export default validateRequest