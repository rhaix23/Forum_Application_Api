import { Document, Types } from "mongoose";
import { IUser } from "./user.types";

export interface IComment {
  _id: Types.ObjectId;
  body: string;
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentWithUser extends Document {
  _id: Types.ObjectId;
  body: string;
  post: Types.ObjectId;
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
}
