import { Request, Response } from "express";
import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: async (req: Request, res: Response) => {
    res.status(429).json({
      msg: "Too many failed login attemp, please try again after an hour",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: async (req: Request, res: Response) => {
    res.status(429).json({
      msg: "Too many accounts created, please try again after 24 hours",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const reportLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 100,
  message: async (req: Request, res: Response) => {
    res.status(429).json({
      msg: "Too many reports submitted, please try again after 24 hours",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 300,
  message: async (req: Request, res: Response) => {
    res.status(429).json({
      msg: "Too many requests, please try again after an hour",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
