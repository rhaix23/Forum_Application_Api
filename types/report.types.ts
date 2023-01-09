import { Types } from "mongoose";
import { IUserIdAndUsername } from "./user.types";

export interface IReport {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  reason: string;
  description: string;
  status: ReportStatus;
  reportedObjectType: ReportType;
  reportedObjectId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmitReportReq {
  user: Types.ObjectId;
  reason: string;
  description: string;
  reportedObjectType: ReportType;
  reportedObjectId: Types.ObjectId;
}

export interface IReportRes extends Omit<IReport, "user"> {
  user: IUserIdAndUsername;
}

export type ReportStatus = "pending" | "resolved" | "closed";

export type ReportType = "User" | "Post" | "Comment";
