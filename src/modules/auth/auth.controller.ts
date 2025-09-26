import { Request, Response } from "express";
import AuthService from "./auth.service.js";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
class AuthController {
  async register(req: Request, res: Response) {
    try {
      const newUser = {
        email: req.body.email as string,
        password: req.body.password as string,
        name: req.body.name as string,
        bio: req.body.bio as string,
        address: req.body.address as string,
        avatarUrl: req.body.avatarUrl as string,
      };
      const notification = await AuthService.register(newUser);
      res.status(201).json(notification);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      res.status(400).json({ error: message });
    }
  }

  async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      await AuthService.verifyOTP(email, otp);
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      res.status(400).json({ error: message });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body);
    try {
      const result = await AuthService.login(email, password);
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        // align to refresh token expiry if available (ms). Adjust as needed.
        maxAge: result.tokenExpiry
          ? Number(result.tokenExpiry)
          : 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        // short-lived access token, e.g., 1h
        maxAge: 60 * 60 * 1000,
      });
      res.status(200).json({
        accessToken: result.accessToken,
        tokenExpiry: result.tokenExpiry,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      res.status(400).json({ error: message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
      }
      const newTokens = await AuthService.refreshToken(refreshToken);
      res.cookie("accessToken", newTokens, { httpOnly: true });
      res.status(200).json({ accessToken: newTokens });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      res.status(400).json({ error: message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      res.status(200).json({
        message:
          "If an account exists for that email, a reset link has been sent.",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      res.status(400).json({ error: message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { resetToken, newPassword } = req.body;
      await AuthService.resetPassword(resetToken, newPassword);
      res.status(200).json({ message: "Password reset successfully" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      res.status(400).json({ error: message });
    }
  }
}
export default new AuthController();
