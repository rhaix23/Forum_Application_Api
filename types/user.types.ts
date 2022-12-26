import { Model, Types } from "mongoose";

export type UserRoles = "user" | "admin";

/* Interface that defines the User   */
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

/* Interface that defines the User  */
export interface IUserInformation extends IUser {
  name: string;
  about: string;
  position: string;
  workingAt: string;
  email: string;
  github: string;
  linkedin: string;
}

/* Interface that defines the User schema methods  */
export interface IUserMethods extends Model<IUserInformation> {
  createToken: (secret: string, expiration: string) => string;
  createAuthTokens: () => { accessToken: string; refreshToken: string };
  comparePassword: (password: string) => Promise<boolean>;
}

/* Interface that defines the User model  */
export type UserModel = Model<IUserInformation, {}, IUserMethods>;

/* Interface that defines the query response for user */
export type UserInformationQuery = Omit<
  IUserInformation,
  "password" | "refreshToken"
>;

/* Interface that defines the query response for user */
export type UserQuery = Omit<IUser, "password" | "refreshToken" | "updatedAt">;
