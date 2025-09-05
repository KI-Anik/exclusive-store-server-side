import  httpStatus  from 'http-status-codes';
import nodemailer from 'nodemailer';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/AppError';

interface MailOptions {
    email: string;
    subject: string;
    html: string;
}

const transporter = nodemailer.createTransport({
    host: envVars.SMTP_HOST,
    port: Number(envVars.SMTP_PORT),
    secure: Number(envVars.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASSWORD,
    },
});


export const sendEmail = async (options: MailOptions) => {
    try {
        const mailOptions = {
            from: `Exclusive Store <${envVars.SMTP_USER}>`, // sender address
            to: options.email, // list of receivers
            subject: options.subject, 
            html: options.html, 
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error from sendEmail', error);
        throw new AppError(httpStatus.BAD_GATEWAY,'Failed to send email.');
    }
};


