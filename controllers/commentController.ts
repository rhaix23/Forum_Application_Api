import { Request, Response } from "express";
import { ForbiddenError } from "../errors/forbiddenError.js";
import { UnAuthenticatedError } from "../errors/unauthenticatedError.js";
import { Comment } from "../models/commentModel.js";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
import { IComment } from "../types/comment.types.js";
import dayjs from "dayjs";
import { verifyObjectId } from "../utils/verifyObjectId.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { Types } from "mongoose";

// @route   GET /api/comment/post/:id
// @desc    Get all comments in a post
// @access  Public
export const getSinglePostComments = async (
  req: Request<
    { id: string },
    never,
    never,
    {
      sort?: string;
      time?: "day" | "week" | "month" | "year";
      page?: number;
      limit?: number;
    }
  >,
  res: Response<{ comments: IComment[]; count: number; pages: number }>
) => {
  const { id } = req.params;
  const sort = req.query.sort || "-createdAt";
  const time = req.query.time;
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const epochTime = dayjs.unix(0); // 1970-01-01T00:00:00.000Z
  const currentDateAndTime = dayjs();
  const oneTimeAgo = currentDateAndTime.subtract(1, time); // 1 day ago, 1 week ago, 1 month ago, 1 year ago
  const startTime = oneTimeAgo.startOf(time || "day"); // date of the first day of the week, month, year

  verifyObjectId(id);

  const comments = await Comment.find({
    post: id,
    createdAt: {
      $gte: req.query.time ? startTime : epochTime,
      $lte: currentDateAndTime,
    },
  })
    .limit(limit)
    .skip((page - 1) * limit)
    .sort(sort)
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "post",
      select: "_id title",
    })
    .lean();

  const count = await Comment.countDocuments({
    post: id,
    createdAt: {
      $gte: req.query.time ? startTime : epochTime,
      $lte: currentDateAndTime,
    },
  }).lean();

  res.status(200).json({
    comments,
    count: comments.length,
    pages: Math.ceil(count / limit),
  });
};

// @route   POST /api/comment
// @desc    Create a comment
// @access  Private
export const createComment = async (
  req: Request<never, never, { body: string; postId: string }>,
  res: Response<{ comment: IComment }>
) => {
  const { body, postId } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.isLocked) {
    throw new ForbiddenError("Post is locked");
  }

  const comment = await Comment.create({
    body,
    post: postId,
    user: req.user!.userId,
  });

  const commentResponse = await Comment.findById(comment._id)
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "post",
      select: "_id title",
    })
    .lean();

  if (!commentResponse) {
    throw new NotFoundError("Comment not found");
  }

  res.status(201).json({ comment: commentResponse });
};

// @route   PATCH /api/comment/:id
// @desc    Update a comment
// @access  Private
export const updateComment = async (
  req: Request<{ id: string }, never, { body: string }>,
  res: Response<{ comment: IComment }>
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

  if (
    comment.user._id.toString() !== req.user!.userId &&
    req.user!.role !== "admin"
  ) {
    throw new UnAuthenticatedError("Unauthorized");
  }

  comment.body = body;
  await comment.save();

  res.status(200).json({ comment });
};

// @route   DELETE /api/comment/:id
// @desc    Delete a comment
// @access  Private
export const deleteComment = async (
  req: Request<{ id: string }>,
  res: Response<{ id: Types.ObjectId }>
) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  const user = await User.findById(req.user!.userId);

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  if (
    comment.user.toString() !== req.user!.userId &&
    user &&
    user.role !== "admin"
  ) {
    throw new ForbiddenError("Unauthorized to delete this comment");
  }

  await comment.remove();

  res.status(200).json({ id: comment._id });
};

// @route   GET /api/comment/user/:id
// @desc    Get all comments by a user
// @access  Public
export const getUserComments = async (
  req: Request<
    { id: string },
    never,
    never,
    { page?: number; limit?: number; sort?: "createdAt" | "-createdAt" }
  >,
  res: Response<{ comments: IComment[]; count: number; pages: number }>
) => {
  const { id } = req.params;
  const page = req.query.page || 1;
  const limit = req.query.limit || 25;
  const sort = req.query.sort || "-createdAt";
  const comments = await Comment.find({ user: id })
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
    });

  const count = await Comment.countDocuments({
    post: id,
  }).lean();

  res.status(200).json({
    comments,
    count: comments.length,
    pages: Math.ceil(count / limit),
  });
};
