import 'dotenv/config'
import {Server} from 'http';
import mongoose from 'mongoose';
import app from './app';
import { error } from 'console';

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

process.on('unhandledRejection', (err)=>{
    console.log('unhandle Rejection detected... server shutting down', err);

    if(server){
        server.close(()=>{
            process.exit(1)
        })
    };
    process.exit(1)
});
process.on('uncaughtException', (err)=> {
    console.log('uncaughtException detected.... server shutting down', err);

    if(server){
        server.close(()=>{
            process.exit(1)
        })
    };
    process.exit(1)
});

process.on('SIGTERM', (err)=>{
    console.log('sigterm signal received.....server shutting down');

    if(server){
        server.close(()=>{
            process.exit(1)
        })
    };
    process.exit(1)
});

process.on('SIGINT', (err)=>{
    console.log('sigint signal received...server shutting down');

    if(server){
        server.close(()=>{
            process.exit(1)
        })
    };
    process.exit(1)
});

startServer();
