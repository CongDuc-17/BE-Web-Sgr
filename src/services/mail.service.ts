import nodemailer from "nodemailer";
import env from "dotenv";

env.config();

const mailConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

export const mailService = {
  async sendMail(emailTo: string, subject: string, text: string) {
    const transporter = nodemailer.createTransport(mailConfig);

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: emailTo,
        subject,
        text,
      });
      console.log(info);
    } catch (err) {
      console.error("Failed to send mail", err);
      throw new Error("Failed to send mail");
    }
  },
};
