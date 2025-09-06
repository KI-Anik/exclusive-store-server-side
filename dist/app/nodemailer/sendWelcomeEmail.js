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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = void 0;
const email_service_1 = require("./email.service");
const sendWelcomeEmail = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = 'Welcome to Exclusive Store!';
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Hello, ${name}!</h2>
        <p>Thank you for joining our community. We are thrilled to have you here!</p>
        <p>You can now explore a wide range of products and start shopping.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://localhost:5173" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Start Shopping
          </a>
        </p>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>The E-commerce Team</p>
      </div>
    `;
    yield (0, email_service_1.sendEmail)({ email, subject, html });
});
exports.sendWelcomeEmail = sendWelcomeEmail;
