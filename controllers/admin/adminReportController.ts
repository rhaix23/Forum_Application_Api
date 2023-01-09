import dayjs from "dayjs";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { NotFoundError } from "../../errors/notFoundError.js";
import { Report } from "../../models/reportModel.js";
import { IQueryOptions } from "../../types/post.types.js";
import { IReport, IReportRes, ReportStatus } from "../../types/report.types";

export const getReports = async (
  req: Request,
  res: Response<{ reports: IReportRes[]; count: number; pages: number }>
) => {
  const {
    searchBy = "",
    value = "",
    start = dayjs().subtract(1, "day"),
    end = dayjs().endOf("day"),
    page = 1,
    limit = 25,
    sort = "createdAt",
    reportStatus,
    reportType,
  } = req.query as IQueryOptions;

  const reports = (await Report.find(
    searchBy === "id"
      ? { _id: value }
      : reportStatus && reportType
      ? {
          createdAt: {
            $gte: start,
            $lte: end,
          },
          reportedObjectType: reportType,
          status: reportStatus,
        }
      : reportStatus
      ? {
          createdAt: {
            $gte: start,
            $lte: end,
          },
          status: reportStatus,
        }
      : reportType
      ? {
          createdAt: {
            $gte: start,
            $lte: end,
          },
          reportedObjectType: reportType,
        }
      : {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }
  )
    .limit(limit)
    .skip((page - 1) * limit)
    .sort(sort)
    .populate({ path: "user", select: "_id username" })
    .lean()) as IReportRes[];

  const count = await Report.countDocuments(
    searchBy === "id"
      ? {
          _id: value,
        }
      : reportStatus && reportType
      ? {
          createdAt: {
            $gte: start,
            $lte: end,
          },
          reportedObjectType: reportType,
          status: reportStatus,
        }
      : reportStatus
      ? {
          createdAt: {
            $gte: start,
            $lte: end,
          },
          status: reportStatus,
        }
      : reportType
      ? {
          createdAt: {
            $gte: start,
            $lte: end,
          },
          reportedObjectType: reportType,
        }
      : {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }
  ).lean();

  res
    .status(201)
    .json({ reports, count: reports.length, pages: Math.ceil(count / limit) });
};

export const updateReport = async (
  req: Request<{ id: Types.ObjectId }, never, { status: ReportStatus }>,
  res: Response<{ report: IReport }>
) => {
  const { id } = req.params;
  const { status } = req.body;

  const report = await Report.findById(id);

  if (!report) {
    throw new NotFoundError("Report not found");
  }

  report.status = status;
  await report.save();

  res.status(200).json({ report });
};

export const deleteReport = async (
  req: Request<{ id: Types.ObjectId }>,
  res: Response<{ id: Types.ObjectId }>
) => {
  const { id } = req.params;

  const report = await Report.findByIdAndDelete(id);

  if (!report) {
    throw new NotFoundError("Report not found");
  }

  res.status(200).json({ id: report._id });
};
