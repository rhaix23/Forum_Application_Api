import dayjs from "dayjs";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { ForbiddenError } from "../errors/forbiddenError.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { Post } from "../models/postModel.js";
import { Subcategory } from "../models/subcategoryModel.js";
import { IPost, IQueryOptions } from "../types/post.types.js";
import { verifyObjectId } from "../utils/verifyObjectId.js";

// @route   GET /api/post/subcategory/:id
// @desc    Get all posts in a subcategory
// @access  Public
export const getSubcategoryPosts = async (
  req: Request,
  res: Response<{ posts: IPost[]; count: number; pages: number }>
) => {
  const { id } = req.params;
  const {
    searchBy = "",
    value = "",
    start = dayjs().subtract(1, "day"),
    end = dayjs().endOf("day"),
    page = 1,
    limit = 25,
    sort = "createdAt",
  } = req.query as IQueryOptions;

  const subcategory = await Subcategory.findById(id).populate("_id").lean();

  if (!subcategory) {
    throw new NotFoundError("Subcategory not found");
  }

  const posts = await Post.find(
    searchBy === "title"
      ? {
          title: { $regex: value, $options: "i" },
          subcategory: subcategory._id,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }
      : {
          subcategory: subcategory._id,
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
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "subcategory",
      select: "_id name allowUsersToPost",
    })
    .populate("likes")
    .populate("dislikes")
    .lean();

  const count = await Post.countDocuments(
    searchBy === "title"
      ? {
          title: { $regex: value, $options: "i" },
          subcategory: subcategory._id,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }
      : {
          subcategory: subcategory._id,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }
  ).lean();

  res
    .status(200)
    .json({ posts, count: posts.length, pages: Math.ceil(count / limit) });
};

// @route   GET /api/post/:id
// @desc    Get a single post
// @access  Public
export const getSinglePost = async (
  req: Request<{ id: string }>,
  res: Response<{ post: IPost }>
) => {
  const { id } = req.params;

  verifyObjectId(id);

  const post = await Post.findById(id)
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "subcategory",
      select: "_id name allowUsersToPost",
    })
    .populate("likes")
    .populate("dislikes");

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  res.status(200).json({ post });
};

// @route   GET /api/post/user/:id
// @desc    Get all posts by a user
// @access  Public
export const getUserPosts = async (
  req: Request<{ id: string }>,
  res: Response<{ posts: IPost[] }>
) => {
  const { id } = req.params;

  verifyObjectId(id);

  const posts = await Post.where("user")
    .equals(id)
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate("likes")
    .populate("dislikes")
    .lean();

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

  const subcategory = await Subcategory.findById(subcategoryId);

  if (!subcategory) {
    throw new NotFoundError("Subcategory not found");
  }

  if (!subcategory.allowUsersToPost && req.user!.role !== "admin") {
    throw new ForbiddenError();
  }

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
      isLocked: boolean;
    }
  >,
  res: Response<{ post: IPost }>
) => {
  const { id } = req.params;
  const { title, body, subcategoryId, isLocked } = req.body;

  const post = await Post.findById(id).populate({
    path: "user",
    select: "_id username",
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const subcategory = await Subcategory.findById(subcategoryId);

  if (!subcategory) {
    throw new NotFoundError("Subcategory not found");
  }

  post.title = title;
  post.body = body;
  post.subcategory = subcategoryId;
  post.isLocked = isLocked;
  await (
    await post.save()
  ).populate({
    path: "subcategory",
    select: "_id name",
  });

  res.status(200).json({ post });
};

// @route   PATCH /api/post/remove/:id
// @desc    Mark a post as removed, but don't delete it
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
    throw new ForbiddenError();
  }

  post.title = "[removed]";
  post.body = "[removed]";
  post.isRemoved = true;
  await post.save();

  res.status(200).json({ post });
};
