import { Request, Response } from "express";
import { Post } from "../models/postModel.js";

// @route   GET /api/post
// @desc    Get all posts
// @access  Public
export const getPosts = async (req: Request, res: Response) => {
  const posts = await Post.find({});
  res.status(200).json({ posts });
};

// @route   GET /api/post/subcategory/:id
// @desc    Get all posts in a subcategory
// @access  Public
export const getSubcategoryPosts = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  const posts = await Post.find({ subcategory: id })
    .populate({
      path: "user",
      select: "_id username",
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
  res: Response
) => {
  const { id } = req.params;
  const post = await Post.findById(id)
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate("likes")
    .populate("dislikes");

  res.status(200).json({ post });
};

export const getUserPosts = async (
  req: Request<{ id: string }>,
  res: Response
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
  res: Response
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
  req: Request<{ id: string }, never, { title: string; body: string }>,
  res: Response
) => {
  const { id } = req.params;
  const { title, body } = req.body;

  const post = await Post.findById(id).populate({
    path: "user",
    select: "_id username",
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  post.title = title;
  post.body = body;
  await post.save();

  res.status(200).json({ post });
};

// @route   DELETE /api/post/:id
// @desc    Delete a post
// @access  Private
export const deletePost = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  await post.remove();

  res.sendStatus(200);
};
