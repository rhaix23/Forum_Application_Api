import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UnAuthenticatedError } from "../errors/unauthenticatedError.js";

const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;

  if (!cookies.accessToken) {
    throw new UnAuthenticatedError("Unauthorized");
  }

  const token = cookies.accessToken;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET as string
    ) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    throw new UnAuthenticatedError("Unauthorized");
  }
};

export { verifyAuth };
