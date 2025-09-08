import httpStatus  from 'http-status-codes';
import { Request, Response } from "express"

const notFoundRoute =(req : Request, res : Response)=>{
    res.status(httpStatus.NOT_FOUND).json({
        success : false,
        message: 'Route Not Found'
    })
}

export default notFoundRoute