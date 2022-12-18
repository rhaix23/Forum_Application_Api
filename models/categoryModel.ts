import mongoose, { Types } from "mongoose";
import { ICategory } from "../types/category.types.js";

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subcategory",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
