import dayjs from "dayjs";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { ForbiddenError } from "../errors/forbiddenError.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { Post } from "../models/postModel.js";
import { Subcategory } from "../models/subcategoryModel.js";
import { IPost } from "../types/post.types.js";
import { verifyObjectId } from "../utils/verifyObjectId.js";

// @route   GET /api/post/subcategory/:id
// @desc    Get all posts in a subcategory
// @access  Public
export const getSubcategoryPosts = async (
  req: Request<
    { id: string },
    never,
    never,
    {
      sort: string;
      time: "day" | "week" | "month" | "year";
      page: number;
      limit: number;
    }
  >,
  res: Response<{ posts: IPost[]; count: number; pages: number }>
) => {
  const { id } = req.params;
  const sort = req.query.sort || "-createdAt";
  const time = req.query.time || "day";
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  const epochTime = dayjs.unix(0); // 1970-01-01T00:00:00.000Z
  const currentDateAndTime = dayjs();
  const oneTimeAgo = currentDateAndTime.subtract(1, time); // 1 day ago, 1 week ago, 1 month ago, 1 year ago
  const startTime = oneTimeAgo.startOf(time); // date of the first day of the week, month, year

  const subcategory = await Subcategory.findById(id);

  if (!subcategory) {
    throw new NotFoundError("Subcategory not found");
  }

  const posts = await Post.find({
    subcategory: id,
    isRemoved: false,
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
      path: "subcategory",
      select: "_id name allowUsersToPost",
    })
    .populate("likes")
    .populate("dislikes")
    .lean();

  const count = await Post.countDocuments({
    subcategory: id,
    isRemoved: false,
    createdAt: {
      $gte: req.query.time ? startTime : epochTime,
      $lte: currentDateAndTime,
    },
  }).lean();

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
