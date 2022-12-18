import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IUser, IUserMethods, UserModel } from "../types/user.types.js";

const UserSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 6,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    name: {
      type: String,
      maxlength: 128,
      trim: true,
      default: "",
    },
    position: {
      type: String,
      default: "",
      maxlength: 32,
      trim: true,
    },
    workingAt: {
      type: String,
      default: "",
      maxlength: 64,
      trim: true,
    },
    about: {
      type: String,
      default: "",
      maxlength: 1000,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    github: {
      type: String,
      default: "",
      trim: true,
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createToken = function (secret: string, expiration: string) {
  const token = jwt.sign(
    { userId: this._id, username: this.username, role: this.role },
    secret,
    { expiresIn: expiration }
  );
  return token;
};

UserSchema.methods.createAuthTokens = function (
  accessTokenSecret: string,
  accessTokenExpiration: string,
  refreshTokenSecret: string,
  refreshTokenExpiration: string
) {
  const accessToken = this.createToken(
    accessTokenSecret,
    accessTokenExpiration
  );
  const refreshToken = this.createToken(
    refreshTokenSecret,
    refreshTokenExpiration
  );
  return { accessToken, refreshToken };
};

UserSchema.methods.comparePassword = async function (password: string) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

export const User = mongoose.model<IUser, UserModel>("User", UserSchema);
