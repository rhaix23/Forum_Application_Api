import { Types } from "mongoose";

export interface ISubcategory {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: Types.ObjectId;
  posts: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
