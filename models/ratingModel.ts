import mongoose from "mongoose";
import { IRating } from "../types/rating.types.js";
import { Post } from "./postModel.js";

const RatingSchema = new mongoose.Schema<IRating>(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    value: {
      type: Number,
      required: true,
      enum: [-1, 0, 1],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

RatingSchema.post("save", async function (doc) {
  if (doc.createdAt === doc.updatedAt) {
    if (doc.value === 1) {
      await Post.findByIdAndUpdate(doc.post, {
        $push: { likes: doc._id },
        $inc: { ratingCount: 1 },
      });
    } else if (doc.value === -1) {
      await Post.findByIdAndUpdate(doc.post, {
        $push: { dislikes: doc._id },
        $inc: { ratingCount: -1 },
      });
    }
  } else {
    if (doc.value === 1) {
      await Post.findByIdAndUpdate(doc.post, {
        $pull: { dislikes: doc._id },
        $push: { likes: doc._id },
        $inc: { ratingCount: 2 },
      });
    } else if (doc.value === -1) {
      await Post.findByIdAndUpdate(doc.post, {
        $pull: { likes: doc._id },
        $push: { dislikes: doc._id },
        $inc: { ratingCount: -2 },
      });
    }
  }
});

RatingSchema.post("remove", async function (doc) {
  if (doc.value === 1) {
    await Post.findByIdAndUpdate(doc.post, {
      $pull: { likes: doc._id },
      $inc: { ratingCount: -1 },
    });
  } else {
    await Post.findByIdAndUpdate(doc.post, {
      $pull: { dislikes: doc._id },
      $inc: { ratingCount: 1 },
    });
  }
});

export const Rating = mongoose.model<IRating>("Rating", RatingSchema);
