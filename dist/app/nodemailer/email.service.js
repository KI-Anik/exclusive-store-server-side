"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const transporter = nodemailer_1.default.createTransport({
    host: env_1.envVars.SMTP_HOST,
    port: Number(env_1.envVars.SMTP_PORT),
    secure: Number(env_1.envVars.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: env_1.envVars.SMTP_USER,
        pass: env_1.envVars.SMTP_PASSWORD,
    },
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailOptions = {
            from: `Exclusive Store <${env_1.envVars.SMTP_USER}>`, // sender address
            to: options.email, // list of receivers
            subject: options.subject,
            html: options.html,
        };
        const info = yield transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Error from sendEmail', error);
        throw new AppError_1.default(http_status_codes_1.default.BAD_GATEWAY, 'Failed to send email.');
    }
});
exports.sendEmail = sendEmail;
