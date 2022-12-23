import mongoose from "mongoose";
import { ISubcategory } from "../types/subcategory.types.js";

const SubcategorySchema = new mongoose.Schema<ISubcategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
    console.log("old category", doc._oldCategory);
    console.log("new category", doc.category);
    console.log("doc id", doc._id);

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
