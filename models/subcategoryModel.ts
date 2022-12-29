import mongoose from "mongoose";
import { ISubcategory } from "../types/subcategory.types.js";

const SubcategorySchema = new mongoose.Schema<ISubcategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      maxlength: 32,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    allowUsersToPost: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

SubcategorySchema.pre("save", async function (this) {
  if (this.isModified("category")) {
    this.$locals.categoryIsModified = true;
  }
});

SubcategorySchema.post("init", function () {
  this._oldCategory = this.category;
});

SubcategorySchema.post("save", async function (doc) {
  if (doc.createdAt === doc.updatedAt) {
    await mongoose.model("Category").updateOne(
      {
        _id: doc.category,
      },
      {
        $push: { subcategories: doc._id },
      }
    );
  }

  if (doc.createdAt !== doc.updatedAt && doc.$locals.categoryIsModified) {
    await mongoose.model("Category").updateOne(
      {
        _id: doc._oldCategory,
      },
      {
        $pull: { subcategories: doc._id },
      }
    );

    await mongoose.model("Category").updateOne(
      {
        _id: doc.category,
      },
      {
        $push: { subcategories: doc._id },
      }
    );
  }
});

SubcategorySchema.post("remove", async function (doc) {
  await mongoose.model("Category").updateOne(
    {
      _id: doc.category,
    },
    {
      $pull: { subcategories: doc._id },
    }
  );
});

export const Subcategory = mongoose.model<ISubcategory>(
  "Subcategory",
  SubcategorySchema
);
