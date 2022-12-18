import mongoose, { Types } from "mongoose";

export interface IComment {
  body: string;
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new mongoose.Schema<IComment>(
  {
    body: {
      type: String,
      required: true,
      trim: true,
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
  // Only push the comment to the post if it's a new comment
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
