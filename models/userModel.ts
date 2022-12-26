import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  IUserInformation,
  IUserMethods,
  UserModel,
} from "../types/user.types.js";
import { verifyObjectId } from "../utils/verifyObjectId.js";

const UserSchema = new mongoose.Schema<
  IUserInformation,
  UserModel,
  IUserMethods
>(
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
      maxlength: 1100,
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
    isDisabled: {
      type: Boolean,
      default: false,
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
    {
      userId: this._id,
      username: this.username,
      role: this.role,
      isDisabled: this.isDisabled,
    },
    secret,
    { expiresIn: expiration }
  );
  return token;
};

UserSchema.methods.createAuthTokens = function () {
  const accessToken = this.createToken(
    process.env.JWT_TOKEN_SECRET as string,
    process.env.JWT_TOKEN_EXPIRATION as string
  );
  const refreshToken = this.createToken(
    process.env.JWT_REFRESH_SECRET as string,
    process.env.JWT_REFRESH_EXPIRATION as string
  );
  return { accessToken, refreshToken };
};

UserSchema.methods.comparePassword = async function (password: string) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

export const User = mongoose.model<IUserInformation, UserModel>(
  "User",
  UserSchema
);
