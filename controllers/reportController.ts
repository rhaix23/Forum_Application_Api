import { Request, Response } from "express";
import { Report } from "../models/reportModel.js";
import { ISubmitReportReq, ReportType } from "../types/report.types.js";

export const submitReport = async (req: Request, res: Response) => {
  const { user, reason, description, reportedObjectId, reportedObjectType } =
    req.body as ISubmitReportReq;

  await Report.create({
    user,
    reason,
    description,
    reportedObjectType,
    reportedObjectId,
  });

  res.sendStatus(201);
};
