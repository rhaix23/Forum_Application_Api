import dayjs from "dayjs";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { NotFoundError } from "../../errors/notFoundError.js";
import { Comment } from "../../models/commentModel.js";
import { ICommentWithPostAndUser } from "../../types/comment.types.js";
import { IQueryOptions } from "../../types/post.types.js";

// @route   GET /api/admin/comment
// @desc    Get all comments
// @access  Private (Admin)
export const getComments = async (
  req: Request,
  res: Response<{
    comments: ICommentWithPostAndUser[];
    count: number;
    pages: number;
  }>
) => {
  const {
    searchBy = "",
    value = "",
    start = dayjs().subtract(1, "day"),
    end = dayjs().endOf("day"),
    page = 1,
    limit = 25,
    sort = "createdAt",
  } = req.query as IQueryOptions;

  const comments = (await Comment.find(
    searchBy === "id"
      ? {
          _id: value,
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
    .populate({
      path: "post",
      select: "_id title",
    })
    .populate({
      path: "user",
      select: "_id username",
    })
    .lean()) as ICommentWithPostAndUser[];

  const count = await Comment.countDocuments({
    createdAt: {
      $gte: start,
      $lte: end,
    },
  }).lean();

  res.status(200).json({
    comments,
    count: comments.length,
    pages: Math.ceil(count / limit),
  });
};

// @route   PATCH /api/admin/comment/:id
// @desc    Update a comment
// @access  Private (Admin)
export const updateComment = async (
  req: Request<{ id: string }, never, { body: string }>,
  res: Response<{ comment: ICommentWithPostAndUser }>
) => {
  const { id } = req.params;
  const { body } = req.body;

  const comment = await Comment.findById(id)
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "post",
      select: "_id title",
    });

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  comment.body = body;
  await comment.save();

  res.status(200).json({ comment: comment.toObject() });
};

// @route   DELETE /api/admin/comment/:id
// @desc    Delete a comment
// @access  Private (Admin)
export const deleteComment = async (
  req: Request<{ id: string }>,
  res: Response<{ id: Types.ObjectId }>
) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  await comment.remove();

  res.status(200).json({ id: comment._id });
};
