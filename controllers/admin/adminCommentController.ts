import { Request, Response } from "express";
import { Types } from "mongoose";
import { NotFoundError } from "../../errors/notFoundError.js";
import { Comment } from "../../models/commentModel.js";
import { ICommentWithPostAndUser } from "../../types/comment.types.js";

// @route   GET /api/admin/comment
// @desc    Get all comments
// @access  Private (Admin)
export const getComments = async (
  req: Request,
  res: Response<{ comments: ICommentWithPostAndUser[] }>
) => {
  const comments = (await Comment.find()
    .populate({
      path: "post",
      select: "_id title",
    })
    .populate({
      path: "user",
      select: "_id username",
    })
    .lean()) as ICommentWithPostAndUser[];
  res.status(200).json({ comments });
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
