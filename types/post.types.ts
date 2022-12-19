import { Types } from "mongoose";

export interface IPost {
  _id: Types.ObjectId;
  title: string;
  body: string;
  subcategory: Types.ObjectId;
  user: Types.ObjectId;
  comments: Types.ObjectId[];
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
