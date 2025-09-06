import httpStatus from 'http-status-codes';
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";


const createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.createUser(req.body)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'user created successfully',
        data: user
    })
})

const getAllUsers = catchAsync(async(req:Request, res: Response)=>{
    const result = await UserService.getAllUsers()

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
    getAllUsers
}