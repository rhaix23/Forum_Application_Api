import mongoose from "mongoose";
import { IComment } from "../types/comment.types.js";

const CommentSchema = new mongoose.Schema<IComment>(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1200,
    },
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
  },
  {
    timestamps: true,
  }
);

CommentSchema.post("save", async function (doc) {
  if (doc.createdAt === doc.updatedAt) {
    await mongoose.model("Post").updateOne(
      {
        _id: doc.post,
      },
      {
        $push: { comments: doc._id },
      }
    );
  }
});

CommentSchema.post("remove", async function (doc) {
  await mongoose.model("Post").updateOne(
    {
      _id: doc.post,
    },
    {
      $pull: { comments: doc._id },
    }
  );
});

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
