import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnAuthenticatedError } from "../errors/unauthenticatedError.js";
import { BadRequestError } from "../errors/badRequestError.js";
import { IUserInformation } from "../types/user.types.js";
import { User } from "../models/userModel.js";

//@desc     Get all users
//@route    GET /api/users
//@access   Private
export const getUsers = async (
  req: Request,
  res: Response<{ users: IUserInformation[] }>
) => {
  const users = await User.find().select("-password -refreshToken");
  res.status(200).json({ users });
};

//@desc     Get single user
//@route    GET /api/users/:id
//@access   Public
export const getSingleUser = async (
  req: Request<{ id: string }>,
  res: Response<{ user: IUserInformation }>
) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new BadRequestError("User not found");
  }

  res.status(200).json({ user });
};

//@desc     Register user
//@route    POST /api/users/register
//@access   Public
export const register = async (
  req: Request<never, never, { username: string; password: string }, never>,
  res: Response<{ user: IUserInformation }>
) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestError("Please provide username and password");
  }

  const userExists = await User.findOne({ username });

  if (userExists) {
    throw new BadRequestError("User with that username already exists");
  }

  const user = await User.create({ username, password });

  const { accessToken, refreshToken } = user.createAuthTokens(
    process.env.JWT_TOKEN_SECRET as string,
    process.env.JWT_TOKEN_EXPIRATION as string,
    process.env.JWT_REFRESH_SECRET as string,
    process.env.JWT_REFRESH_EXPIRATION as string
  );

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60, // 1 hour
  });

  res.status(201).json({
    user: {
      _id: user._id,
      username: user.username,
      role: user.role,
      name: user.name,
      about: user.about,
      position: user.position,
      workingAt: user.workingAt,
      email: user.email,
      linkedin: user.linkedin,
      github: user.github,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};

//@desc     Login user
//@route    POST /api/users/login
//@access   Public
export const login = async (
  req: Request<never, never, { username: string; password: string }, never>,
  res: Response<{ user: IUserInformation }>
) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    throw new UnAuthenticatedError("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new UnAuthenticatedError("Invalid credentials");
  }

  const { accessToken, refreshToken } = user.createAuthTokens(
    process.env.JWT_TOKEN_SECRET as string,
    process.env.JWT_TOKEN_EXPIRATION as string,
    process.env.JWT_REFRESH_SECRET as string,
    process.env.JWT_REFRESH_EXPIRATION as string
  );

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60, // 1 hour
  });

  res.status(200).json({
    user: {
      _id: user._id,
      username: user.username,
      role: user.role,
      name: user.name,
      about: user.about,
      position: user.position,
      workingAt: user.workingAt,
      email: user.email,
      linkedin: user.linkedin,
      github: user.github,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};

//@desc     Logout user
//@route    POST /api/users/logout
//@access   Public
export const logout = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies.refreshToken) {
    return res.sendStatus(400);
  }

  const refreshToken = cookies.refreshToken;

  const user = await User.findOne({ token: refreshToken });

  if (!user) {
    res.clearCookie("refreshToken", { httpOnly: true });
    res.clearCookie("accessToken", { httpOnly: true });
    return res.sendStatus(200);
  }

  user.refreshToken = "";
  await user.save();

  res.clearCookie("refreshToken", { httpOnly: true });
  res.clearCookie("accessToken", { httpOnly: true });

  res.sendStatus(200);
};

//@desc     Update user
//@route    PATCH /api/users/:id
//@access   Private
export const updateUser = async (
  req: Request<
    { id: string },
    never,
    {
      name: string;
      position: string;
      workingAt: string;
      about: string;
      email: string;
      linkedin: string;
      github: string;
    }
  >,
  res: Response<{ user: IUserInformation }>
) => {
  const { id } = req.params;
  const { name, position, workingAt, about, email, linkedin, github } =
    req.body;

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new BadRequestError("User not found");
  }

  if (user._id.toString() !== req.user!.userId) {
    throw new UnAuthenticatedError("You are not authorized");
  }

  user.name = name;
  user.position = position;
  user.workingAt = workingAt;
  user.about = about;
  user.email = email;
  user.linkedin = linkedin;
  user.github = github;
  await user.save();

  res.status(200).json({ user });
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;

  const user = User.findById(id);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  await user.remove();

  res.sendStatus(200);
};

//@desc    Change password
//@route   PATCH /api/users/changepassword
//@access  Private
export const changePassword = async (
  req: Request<never, never, { currentPassword: string; newPassword: string }>,
  res: Response
) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.userId);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const passwordsMatch = await user.comparePassword(currentPassword);

  if (!passwordsMatch) {
    throw new BadRequestError("Invalid password");
  }

  user.password = newPassword;
  await user.save();

  res.sendStatus(200);
};

//@desc     Regenerate access token
//@route    POST /api/users/refresh
//@access   Public
export const handleRefreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies.refreshToken) {
    throw new UnAuthenticatedError("Unauthorized");
  }

  const refreshToken = cookies.refreshToken;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw new UnAuthenticatedError("Unauthorized");
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as JwtPayload;

    if (user.username !== decoded.username) {
      throw new UnAuthenticatedError("Unauthorized");
    }

    const accessToken = user.createToken(
      process.env.JWT_TOKEN_SECRET as string,
      "30s"
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      // secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    res.sendStatus(200);
  } catch (error) {
    return res.status(403).json(error);
  }

  res.sendStatus(200);
};

//@desc     Get logged in user's information
//@route    GET /api/users/me
export const me = async (
  req: Request,
  res: Response<{ user: IUserInformation }>
) => {
  const cookies = req.cookies;

  if (!cookies.accessToken) {
    throw new UnAuthenticatedError("Unauthorized");
  }

  const accessToken = cookies.accessToken;

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_TOKEN_SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decoded.userId.trim()).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new UnAuthenticatedError("Unauthorized");
    }

    res.status(200).json({ user });
  } catch (error) {
    throw new UnAuthenticatedError("Invalid Token");
  }
};
