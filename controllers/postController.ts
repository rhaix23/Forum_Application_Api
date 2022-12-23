import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { BadRequestError } from "../errors/badRequestError.js";
import { ForbiddenError } from "../errors/forbiddenError.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { Comment } from "../models/commentModel.js";
import { Post } from "../models/postModel.js";
import { IPost } from "../types/post.types.js";

// @route   GET /api/post
// @desc    Get all posts
// @access  Public
export const getPosts = async (req: Request, res: Response) => {
  const posts = await Post.find({})
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "subcategory",
      select: "_id name",
    });
  res.status(200).json({ posts });
};

// @route   GET /api/post/subcategory/:id
// @desc    Get all posts in a subcategory
// @access  Public
export const getSubcategoryPosts = async (
  req: Request<{ id: string }>,
  res: Response<{ posts: IPost[] }>
) => {
  const { id } = req.params;
  const posts = await Post.find({ subcategory: id, isRemoved: false })
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "subcategory",
      select: "_id name",
    })
    .populate("likes")
    .populate("dislikes");

  res.status(200).json({ posts });
};

// @route   GET /api/post/:id
// @desc    Get a single post
// @access  Public
export const getSinglePost = async (
  req: Request<{ id: string }>,
  res: Response<{ post: IPost }>
) => {
  const { id } = req.params;
  const post = await Post.findById(id)
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "subcategory",
      select: "_id name",
    })
    .populate("likes")
    .populate("dislikes");

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  res.status(200).json({ post });
};

export const getUserPosts = async (
  req: Request<{ id: string }>,
  res: Response<{ posts: IPost[] }>
) => {
  const { id } = req.params;
  const posts = await Post.find({ user: id })
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate("likes")
    .populate("dislikes");

  res.status(200).json({ posts });
};

// @route   POST /api/post
// @desc    Create a post
// @access  Private
export const createPost = async (
  req: Request<
    never,
    never,
    { title: string; body: string; subcategoryId: string }
  >,
  res: Response<{ post: IPost }>
) => {
  const { title, body, subcategoryId } = req.body;

  const post = await Post.create({
    title,
    body,
    subcategory: subcategoryId,
    user: req.user!.userId,
  });

  res.status(201).json({ post });
};

// @route   PATCH /api/post/:id
// @desc    Update a post
// @access  Private
export const updatePost = async (
  req: Request<
    { id: string },
    never,
    {
      title: string;
      body: string;
      subcategoryId: Types.ObjectId;
      lockPost: boolean;
    }
  >,
  res: Response<{ post: IPost }>
) => {
  const { id } = req.params;
  const { title, body, subcategoryId, lockPost } = req.body;

  if (!mongoose.isValidObjectId(subcategoryId)) {
    throw new BadRequestError("Invalid subcategory id");
  }

  const post = await Post.findById(id).populate({
    path: "user",
    select: "_id username",
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  post.title = title;
  post.body = body;
  post.subcategory = subcategoryId;
  post.isLocked = lockPost;
  await (
    await post.save()
  ).populate({
    path: "subcategory",
    select: "_id name",
  });

  res.status(200).json({ post });
};

// @route   DELETE /api/post/:id
// @desc    Delete a post
// @access  Private
export const deletePost = async (
  req: Request<{ id: string }>,
  res: Response<{ id: string }>
) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return res.sendStatus(404);
  }

  await Comment.deleteMany({ post: id });
  await post.remove();

  res.status(200).json({ id });
};

// @route   PATCH /api/post/remove/:id
// @desc    Remove a post
// @access  Private
export const removePost = async (
  req: Request<{ id: string }>,
  res: Response<{ post: IPost }>
) => {
  const { id } = req.params;

  const post = await Post.findById(id)
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "subcategory",
      select: "_id name",
    });

  if (!post) {
    return res.sendStatus(404);
  }

  if (post.user._id.toString() !== req.user!.userId) {
    throw new ForbiddenError("User does not have permission to remove post");
  }

  post.title = "[removed]";
  post.body = "[removed]";
  post.isRemoved = true;
  await post.save();

  res.status(200).json({ post });
};
