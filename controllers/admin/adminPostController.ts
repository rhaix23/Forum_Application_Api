import dayjs from "dayjs";
import { Request, Response } from "express";
import { NotFoundError } from "../../errors/notFoundError.js";
import { Comment } from "../../models/commentModel.js";
import { Post } from "../../models/postModel.js";
import { Subcategory } from "../../models/subcategoryModel.js";
import {
  IQueryOptions,
  IPostResponse,
  IUpdatePostRequestBody,
} from "../../types/post.types.js";

// @route   GET /api/admin/post
// @desc    Get all posts
// @access  Private (admin)
export const getPosts = async (
  req: Request,
  res: Response<{ posts: IPostResponse[]; count: number; pages: number }>
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

  const posts = await Post.find(
    searchBy === "title"
      ? {
          title: { $regex: value, $options: "i" },
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }
      : searchBy === "id"
      ? {
          _id: value,
        }
      : searchBy === "user"
      ? {
          user: value,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }
      : searchBy === "subcategory"
      ? {
          subcategory: value,
          createdAt: {
            $gte: start,
            $lte: end,
          },
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
    .select("_id title body isLocked isRemoved createdAt updatedAt")
    .populate({
      path: "user",
      select: "_id username",
    })
    .populate({
      path: "subcategory",
      select: "_id name",
    })
    .lean();

  const count = await Post.countDocuments(
    searchBy === "title"
      ? {
          title: { $regex: value, $options: "i" },
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }
      : searchBy === "id"
      ? {
          _id: value,
        }
      : searchBy === "user"
      ? {
          user: value,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }
      : searchBy === "subcategory"
      ? {
          subcategory: value,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }
      : {
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

// @route   PATCH /api/admin/post/:id
// @desc    Update a post
// @access  Private (admin)
export const updatePost = async (
  req: Request<{ id: string }, unknown, IUpdatePostRequestBody>,
  res: Response<{ post: IPostResponse }>
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

  const subcategory = await Subcategory.findById(subcategoryId).lean();

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

// @route   DELETE /api/admin/post/:id
// @desc    Delete a post and its comments
// @access  Private (admin)
export const deletePost = async (
  req: Request<{ id: string }>,
  res: Response<{ id: string }>
) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  await Comment.deleteMany({ post: id });
  await post.remove();

  res.status(200).json({ id });
};

// @route   PATCH /api/admin/post/remove/:id
// @desc    Marks a post as removed but does not delete it
// @access  Private admin)
export const removePost = async (
  req: Request<{ id: string }>,
  res: Response<{ post: IPostResponse }>
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

  post.title = "[removed]";
  post.body = "[removed]";
  post.isRemoved = true;
  await post.save();

  res.status(200).json({ post });
};
