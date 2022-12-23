import mongoose from "mongoose";
import { IPost } from "../types/post.types.js";

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
      maxLength: 3500,
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
    isLocked: {
      type: Boolean,
      default: false,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.pre("save", async function (this) {
  if (this.createdAt === this.updatedAt) {
    await mongoose.model("Subcategory").updateOne(
      {
        _id: this.subcategory,
      },
      {
        $pull: { posts: this._id },
      }
    );
  }

  if (this.isModified("subcategory")) {
    this.$locals.subcategoryIsModified = true;
  }
});

PostSchema.post("init", function () {
  this._oldSubcategory = this.subcategory;
});

PostSchema.post("save", async function (doc) {
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

  if (doc.createdAt !== doc.updatedAt && doc.$locals.subcategoryIsModified) {
    await mongoose.model("Subcategory").updateOne(
      {
        _id: doc._oldSubcategory,
      },
      {
        $pull: { posts: doc._id },
      }
    );

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
