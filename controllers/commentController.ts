import { Request, Response } from "express";
import { BadRequestError } from "../errors/badRequestError.js";
import { ForbiddenError } from "../errors/forbiddenError.js";
import { UnAuthenticatedError } from "../errors/unauthenticatedError.js";
import { Comment } from "../models/commentModel.js";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
import { IComment } from "../types/comment.types.js";

// @route   GET /api/comment
// @desc    Get all comments
// @access  Private
export const getComments = async (
  req: Request,
  res: Response<{ comments: IComment[] }>
) => {
  const comments = await Comment.find({}).populate("post").populate({
    path: "user",
    select: "-password -refreshToken",
  });
  res.status(200).json({ comments });
};

// @route   GET /api/comment/post/:id
// @desc    Get all comments in a post
// @access  Public
export const getSinglePostComments = async (
  req: Request<{ id: string }>,
  res: Response<{ comments: IComment[] }>
) => {
  const { id } = req.params;

  const comments = await Comment.find({ post: id })
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "post",
      select: "title",
    });

  res.status(200).json({ comments });
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
    throw new BadRequestError("Post not found");
  }

  if (post.isLocked) {
    throw new ForbiddenError("Post is locked");
  }

  const comment = await Comment.create({
    body,
    post: postId,
    user: req.user!.userId,
  });

  res.status(201).json({ comment });
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

  const comment = await Comment.findById(id).populate({
    path: "user",
    select: "_id username",
  });

  if (!comment) {
    throw new BadRequestError("Comment not found");
  }

  if (comment.user._id.toString() !== req.user!.userId) {
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
  res: Response
) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  const user = await User.findById(req.user!.userId);

  if (!comment) {
    throw new BadRequestError("Comment not found");
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

export const getUserComments = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  const comments = await Comment.find({ user: id })
    .populate({
      path: "post",
      select: "title",
    })
    .populate({
      path: "user",
      select: "_id username",
    });

  res.status(200).json({ comments });
};
