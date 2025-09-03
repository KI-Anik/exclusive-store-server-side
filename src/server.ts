import 'dotenv/config'
import {Server} from 'http';
import mongoose from 'mongoose';
import app from './app';

let server : Server;

const startServer = async ()=>{
    try {
        await mongoose.connect(process.env.DB_URL as string)
        console.log('connected to db');

        server = app.listen(process.env.PORT, ()=>{
            console.log(`Server running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log(error);
    }
}

startServer()