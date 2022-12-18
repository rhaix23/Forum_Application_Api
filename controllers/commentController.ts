import { Request, Response } from "express";
import { BadRequestError } from "../errors/badRequestError.js";
import { UnAuthenticatedError } from "../errors/unauthenticatedError.js";
import { Comment, IComment } from "../models/commentModel.js";

// @route   GET /api/comment
// @desc    Get all comments
// @access  Private
export const getComments = async (req: Request, res: Response) => {
  const comments = await Comment.find({});
  res.status(200).json({ comments });
};

// @route   GET /api/comment/post/:id
// @desc    Get all comments in a post
// @access  Private
export const getSinglePostComments = async (
  req: Request<{ id: string }>,
  res: Response
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
  res: Response
) => {
  const { body, postId } = req.body;

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

  if (!comment) {
    throw new BadRequestError("Comment not found");
  }

  if (comment.user.toString() !== req.user!.userId) {
    throw new BadRequestError("Unauthorized");
  }

  await comment.remove();

  res.sendStatus(204);
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
