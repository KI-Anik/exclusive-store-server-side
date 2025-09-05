import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import { router } from './routes';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import notFound from './app/middleware/notFound';
import { envVars } from './app/config/env';

const app = express()

app.use(
  cors({
    origin: envVars.FRONTEND_URL, 
    credentials: true, // Allow cookies to be sent and received
  }),
);

app.use(cookieParser())
app.use(express.json())

app.use('/api/v1', router )

app.get('/', async(req:Request, res: Response)=>{
    res.status(200).json({
        message: 'Welcome to exclusive-store server'
    })
})

app.use(globalErrorHandler)
app.use(notFound) //route not found

export default app