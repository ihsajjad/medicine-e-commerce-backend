import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const generateRefreshToken = (userId: string, userRole: string) => {
  const token = jwt.sign(
    { userId, userRole },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "1d",
    }
  );

  return token;
};

export const generateAccessToken = (refreshToken: string) => {
  const token = jwt.sign(
    { refreshToken },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "1h",
    }
  );

  return token;
};

export const sendVerificationCode = (
  userName: string,
  email: string,
  code: number
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_EMAIL_PASSWORD,
    },
  });

  async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"CareCube Health Solutions" <${process.env.SENDER_EMAIL}>`, // sender address
      to: email,
      subject: "Email verification code",
      text: "",
      html: `<!DOCTYPE html>
             <html lang="en">
             <head>
             <meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, initial-scale=1.0">
                 <title>Verification Code</title>
             </head>
             <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #2c3e50;">Care Cube Verification Code</h2>
                    <p>Hello ${userName},</p>
                    <p>Thank you for choosing Care Cube. Your verification code is:</p>
                    <div style="font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; color: #27ae60;">${code}</div>
                    <p>Please enter this code on the Care Cube website to verify your account.</p>
                    <p>If you did not request this code, please ignore this email or contact our support team.</p>
                    <p>Best regards,</p>
                    <p>The Care Cube Team</p>
                    <p style="font-size: 12px; color: #7f8c8d;">If you need help, please contact us at <a href="mailto:support@carecube.com">support@carecube.com</a>.</p>
                </div>
             </body>
             </html>`,
    });

    return info;
  }

  return main().catch(console.error);
};
