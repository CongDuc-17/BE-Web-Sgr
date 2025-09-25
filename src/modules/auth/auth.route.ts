import express from "express";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import AuthController from "./auth.controller.js";
import { createApiResponse } from "../../swagger/openAPIResponseBuilders.js";
import passport from "@/configs/passport.config.js";

export const authRegistry = new OpenAPIRegistry();

const authRoute = express.Router();

// Register OpenAPI schemas
const UserRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().optional(),
  }),
});

// Register API paths
authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Authentication"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserRegisterSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    AuthResponseSchema,
    "User registered successfully"
  ),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Authentication"],
  summary: "Login user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserLoginSchema,
        },
      },
    },
  },
  responses: createApiResponse(AuthResponseSchema, "Login successful"),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/refresh-token",
  tags: ["Authentication"],
  summary: "Refresh access token",
  request: {
    params: z.object({}),
    query: z.object({}),
    headers: z.object({}),
    body: undefined,
  },
  parameters: [
    {
      name: "refreshToken",
      in: "cookie",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: createApiResponse(
    z.object({
      accessToken: z.string(),
    }),
    "Token refreshed successfully"
  ),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  tags: ["Authentication"],
  summary: "Request password reset",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      resetToken: z.string(),
    }),
    "Password reset token sent"
  ),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["Authentication"],
  summary: "Reset user password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            resetToken: z.string(),
            newPassword: z.string().min(6),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      message: z.string(),
    }),
    "Password reset successfully"
  ),
});

authRegistry.registerPath({
  method: "get",
  path: "/auth/google/login",
  tags: ["Authentication"],
  summary: "Authenticate with Google",
  responses: createApiResponse(
    z.object({
      message: z.string(),
      user: z
        .object({
          id: z.string(),
          email: z.string(),
          name: z.string().optional(),
        })
        .optional(),
    }),
    "Google authentication successful"
  ),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/verify-otp",
  tags: ["Authentication"],
  summary: "Verify OTP for email verification",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
            otp: z.string().length(6),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      message: z.string(),
    }),
    "Email verified successfully"
  ),
});

authRoute.post("/register", AuthController.register);
authRoute.post("/verify-otp", AuthController.verifyOTP);
authRoute.post("/login", AuthController.login);
authRoute.post("/refresh-token", AuthController.refreshToken);
authRoute.post("/forgot-password", AuthController.forgotPassword);
authRoute.post("/reset-password", AuthController.resetPassword);
authRoute.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRoute.get(
  "/google/login",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication, redirect or respond as needed.
    res
      .status(200)
      .json({ message: "Google authentication successful", user: req.user });
  }
);
export default authRoute;
