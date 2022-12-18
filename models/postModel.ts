import mongoose, { Types } from "mongoose";

export interface IPost {
  title: string;
  body: string;
  subcategory: Types.ObjectId;
  user: Types.ObjectId;
  comments: Types.ObjectId[];
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new mongoose.Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],
  },
  {
    timestamps: true,
  }
);

PostSchema.post("save", async function (doc) {
  // Only push the post to the subcategory if it's a new post
  if (doc.createdAt === doc.updatedAt) {
    await mongoose.model("Subcategory").updateOne(
      {
        _id: doc.subcategory,
      },
      {
        $push: { posts: doc._id },
      }
    );
  }
});

PostSchema.post("remove", async function (doc) {
  await mongoose.model("Subcategory").updateOne(
    {
      _id: doc.subcategory,
    },
    {
      $pull: { posts: doc._id },
    }
  );
});

export const Post = mongoose.model<IPost>("Post", PostSchema);
