import { Request, Response } from "express";
import AuthService from "./auth.service.js";
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
    } catch (error: string | any) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      await AuthService.verifyOTP(email, otp);
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error: string | any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const result = await AuthService.login(email, password);
      res.cookie("refreshToken", result.refreshToken, { httpOnly: true });
      res.cookie("accessToken", result.accessToken, { httpOnly: true });
      res.status(200).json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenExpiry: result.tokenExpiry,
      });
    } catch (error: string | any) {
      res.status(401).json({ error: error.message });
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
    } catch (error: string | any) {
      res.status(401).json({ error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const resetToken = await AuthService.forgotPassword(email);
      res.status(200).json({ resetToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { resetToken, newPassword } = req.body;
      await AuthService.resetPassword(resetToken, newPassword);
      res.status(200).json({ message: "Password reset successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
export default new AuthController();
