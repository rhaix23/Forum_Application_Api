import { Request, Response } from "express";
import { NotFoundError } from "../../errors/notFoundError.js";
import { User } from "../../models/userModel.js";
import { IUserInformation } from "../../types/user.types.js";

//@desc     Get all users
//@route    GET /api/admin/users
//@access   Private (admin)
export const getUsers = async (
  req: Request,
  res: Response<{ users: IUserInformation[] }>
) => {
  const users = await User.find().select("-password -refreshToken").lean();
  res.status(200).json({ users });
};

//@desc     Update user
//@route    PATCH /api/admin/user/:id
//@access   Private (admin)
export const updateUser = async (
  req: Request<{ id: string }, unknown, IUserInformation>,
  res: Response
) => {
  const { id } = req.params;
  const { name, position, workingAt, about, email, linkedin, github } =
    req.body;

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new NotFoundError("User not found");
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

//@desc     Delete user
//@route    DELETE /api/admin/users/:id
//@access   Private (admin)
export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.sendStatus(200);
};

//@desc     Update account status
//@route    PATCH /api/admin/users/status/:id
//@access   Private (admin)
export const updateStatus = async (
  req: Request<{ id: string }>,
  res: Response<{ user: IUserInformation }>
) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.isDisabled = !user.isDisabled;
  await user.save();

  res.status(200).json({ user });
};
