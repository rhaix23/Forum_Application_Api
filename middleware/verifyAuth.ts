import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UnAuthenticatedError } from "../errors/unauthenticatedError.js";

const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;

  if (!cookies.accessToken) {
    throw new UnAuthenticatedError("Unauthorized");
  }

  const token = cookies.accessToken;

  const decoded = jwt.verify(
    token,
    process.env.JWT_TOKEN_SECRET as string
  ) as JwtPayload;

  if (!decoded) {
    throw new UnAuthenticatedError("Unauthorized");
  } else {
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  }
};

export { verifyAuth };
