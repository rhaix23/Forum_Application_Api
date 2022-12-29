import { Types } from "mongoose";
import { IPostIdAndTitle } from "./post.types";
import { IUserIdAndUsername } from "./user.types";

/***********************************************************
 *                Comment Type Definitions                 *
 * ********************************************************/
export interface IComment {
  _id: Types.ObjectId;
  body: string;
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentWithPostAndUser
  extends Omit<IComment, "post" | "user"> {
  post: IPostIdAndTitle;
  user: IUserIdAndUsername;
}
