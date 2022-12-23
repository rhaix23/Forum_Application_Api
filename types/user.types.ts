import { Model, Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  password: string;
  role: "user" | "admin";
  name: string;
  about: string;
  position: string;
  workingAt: string;
  email: string;
  github: string;
  linkedin: string;
  isDisabled: boolean;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods extends Model<IUser> {
  createToken: (secret: string, expiration: string) => string;
  createAuthTokens: (
    accessTokenSecret: string,
    accessTokenExpiration: string,
    refreshTokenSecret: string,
    refreshTokenExpiration: string
  ) => { accessToken: string; refreshToken: string };
  comparePassword: (password: string) => Promise<boolean>;
}

export type UserModel = Model<IUser, {}, IUserMethods>;

export type IUserInformation = Omit<IUser, "password" | "refreshToken">;
