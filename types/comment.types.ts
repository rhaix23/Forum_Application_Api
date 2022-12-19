import { Types } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  body: string;
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
