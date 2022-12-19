import { Types } from "mongoose";

export interface IRating {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}
