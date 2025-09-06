import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import { router } from './routes';

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(cors())

app.use('/api/v1', router )

app.get('/', async(req:Request, res: Response)=>{
    res.status(200).json({
        message: 'Welcome to exclusive-store server'
    })
})

export default app