import { Request, Response, NextFunction } from "express";
import { verifyAuth } from "./verifyAuth.js";

const verifyRole = async (req: Request, res: Response, next: NextFunction) => {
  verifyAuth(req, res, async () => {
    if (req.user!.role === "admin") {
      next();
    } else {
      res.status(403).json({ msg: "User has no access permission" });
    }
  });
};

export { verifyRole };
