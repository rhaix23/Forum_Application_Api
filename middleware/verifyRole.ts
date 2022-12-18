import { Request, Response, NextFunction } from "express";
import { User } from "../models/userModel.js";
import { verifyAuth } from "./verifyAuth.js";

const verifyRole = async (req: Request, res: Response, next: NextFunction) => {
  verifyAuth(req, res, async () => {
    const user = await User.findById(req.user!.userId);

    if (user!.role === "admin") {
      next();
    } else {
      res.status(403).json({ msg: "User has no access permission" });
    }
  });
};

export { verifyRole };
