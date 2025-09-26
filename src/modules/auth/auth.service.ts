import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "../../configs/index.js";
import { mailService } from "../../services/mail.service.js";

dotenv.config();

class AuthService {
  async register(data: any) {
    try {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
      const user = await prisma.users.create({
        data: {
          email: data.email,
          password: data.password,
          name: data.name,
          bio: data.bio,
          address: data.address,
          avatarUrl: data.avatarUrl,
        },
      });
      await this.sendOTP(data.email);
      return { message: "Check your mail to active account" };
    } catch (error: any) {
      console.error("Error in service register:", error.message);
      throw error;
    }
  }

  async sendOTP(email: string) {
    try {
      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) throw new Error("Email not found");
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      await prisma.users.update({
        where: { email },
        data: { reset_otp: otp, otp_expiry: otpExpiry },
      });
      await mailService.sendMail(
        email,
        "Your OTP Code",
        `Your OTP code is ${otp}. It will expire in 10 minutes.`
      );
      return true;
    } catch (error: any) {
      console.error("Error in service sendOTP:", error.message);
      throw error;
    }
  }

  async verifyOTP(email: string, otp: string) {
    try {
      const user = await prisma.users.findUnique({ where: { email } });

      if (!user) throw new Error("Email not found");
      if (user.isActive === 1) return true;
      if (user.reset_otp !== otp) throw new Error("Invalid OTP");
      if (!user.otp_expiry || user.otp_expiry < new Date())
        throw new Error("OTP expired");
      await prisma.users.update({
        where: { email },
        data: { reset_otp: null, otp_expiry: null, isActive: 1 },
      });
      return true;
    } catch (error: any) {
      console.error("Error in service verifyOTP:", error.message);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await prisma.users.findUnique({
        where: { email: email },
      });
      if (!user) {
        throw new Error("Email incorrect!");
      }
      if (user.isActive === 0) {
        throw new Error("Please verify your email before logging in.");
      }
      if (!user.password) {
        throw new Error(
          "This account is registered with OAuth. Please login with Google/Facebook, etc."
        );
      }
      const pass = await bcrypt.compare(password, user.password);
      if (!pass) throw new Error("Password incorrect!");
      //create access token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      //create refresh token
      const refreshToken = crypto.randomBytes(40).toString("hex");
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 7);
      //save refresh token to db
      await prisma.users.update({
        where: {
          email: user.email,
        },
        data: {
          refresh_token: refreshToken,
          token_expiry: tokenExpiry,
        },
      });
      return { accessToken, refreshToken, tokenExpiry };
    } catch (error: any) {
      console.error("Error in service login:", error.message);
      throw error;
    }
  }
  //cap lai access token
  async refreshToken(refreshToken: string) {
    try {
      const user = await prisma.users.findFirst({
        where: { refresh_token: refreshToken },
      });
      if (!user) throw new Error("Invalid refresh token");
      if (!user.token_expiry || user.token_expiry < new Date())
        throw new Error("Refresh token expired");
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      return accessToken;
    } catch (error: any) {
      console.error("Error in service refreshToken:", error.message);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      await this.sendOTP(email);
      return { message: "Check your mail to reset password" };
    } catch (error: any) {
      console.error("Error in service forgotPassword:", error.message);
      throw error;
    }
  }
  async resetPassword(OTP: string, newPassword: string) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);
      const user = await prisma.users.findFirst({
        where: { reset_otp: OTP },
      });
      if (!user) throw new Error("Invalid reset token");
      if (!user.otp_expiry || user.otp_expiry < new Date()) {
        throw new Error("Reset token expired");
      }
      await prisma.users.update({
        where: { id: user.id },
        data: { password: hashed, reset_otp: null, otp_expiry: null },
      });
    } catch (error: any) {
      console.error("Error in service resetPassword:", error.message);
      throw error;
    }
  }
}

export default new AuthService();
