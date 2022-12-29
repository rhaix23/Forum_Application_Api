import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UnAuthenticatedError } from "../errors/unauthenticatedError.js";
import { ForbiddenError } from "../errors/forbiddenError.js";

const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;
  const accessToken = cookies.accessToken;

  if (!cookies.accessToken) {
    throw new UnAuthenticatedError("User not authenticated, please login");
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_TOKEN_SECRET as string
    ) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      isDisabled: decoded.isDisabled,
    };

    if (req.user.isDisabled) {
      throw new ForbiddenError();
    }

    next();
  } catch (error) {
    throw new UnAuthenticatedError("Unauthorized");
  }
};

export { verifyAuth };
