import mongoose from "mongoose";
import { IReport } from "../types/report.types";

const ReportSchema = new mongoose.Schema<IReport>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    reportedObjectType: {
      type: String,
      enum: ["User", "Post", "Comment"],
      trim: true,
      required: true,
    },
    reportedObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "closed"],
      default: "pending",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model<IReport>("Report", ReportSchema);
