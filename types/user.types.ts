import { Model, Types } from "mongoose";

export type UserRoles = "user" | "admin";

export interface IUserIdAndUsername {
  _id: Types.ObjectId;
  username: string;
}

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  password: string;
  role: UserRoles;
  isDisabled: boolean;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInformation extends IUser {
  name: string;
  about: string;
  position: string;
  workingAt: string;
  email: string;
  github: string;
  linkedin: string;
}

export interface IUserMethods extends Model<IUserInformation> {
  createToken: (secret: string, expiration: string) => string;
  createAuthTokens: () => { accessToken: string; refreshToken: string };
  comparePassword: (password: string) => Promise<boolean>;
}

export type UserModel = Model<IUserInformation, {}, IUserMethods>;
