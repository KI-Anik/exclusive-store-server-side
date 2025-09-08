import { sendEmail } from "./email.service";

export const sendWelcomeEmail = async (email: string, name: string) => {
    const subject = 'Welcome to Exclusive Store!';
    const html =  `
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

    await sendEmail({ email, subject, html });
};