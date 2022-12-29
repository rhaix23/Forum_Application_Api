import dayjs from "dayjs";
import { Types } from "mongoose";
import { ISubcategoryIdAndName } from "./subcategory.types";
import { IUserIdAndUsername } from "./user.types";

export interface IPostIdAndTitle {
  _id: Types.ObjectId;
  title: string;
}

export interface IPost {
  _id: Types.ObjectId;
  title: string;
  body: string;
  subcategory: Types.ObjectId;
  user: Types.ObjectId;
  comments: Types.ObjectId[];
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  ratingCount: number;
  isLocked: boolean;
  isRemoved: boolean;
  createdAt: Date;
  updatedAt: Date;
  _oldSubcategory: Types.ObjectId; // Not an actual field in the database, but used in the mongoose middleware
}

export interface IUpdatePostRequestBody {
  title: string;
  body: string;
  subcategoryId: Types.ObjectId;
  isLocked: boolean;
}

export interface IGetPostsRequestQuery {
  type?: "title" | "creator";
  value?: string;
  start?: dayjs.Dayjs;
  end?: dayjs.Dayjs;
  page?: number;
  limit?: number;
}

export interface IPostResponse {
  _id: Types.ObjectId;
  title: string;
  body: string;
  isLocked: boolean;
  isRemoved: boolean;
  user: Types.ObjectId | IUserIdAndUsername;
  subcategory: Types.ObjectId | ISubcategoryIdAndName;
  createdAt: Date;
  updatedAt: Date;
}
