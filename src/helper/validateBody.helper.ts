import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateBody =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: parsed.error.issues });
    }
    next();
  };
