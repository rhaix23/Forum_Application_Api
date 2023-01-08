import { Request, Response } from "express";
import { NotFoundError } from "../errors/notFoundError.js";
import { Category } from "../models/categoryModel.js";
import { ICategoryWithSubcategories } from "../types/category.types.js";

// @route   GET /api/category
// @desc    Get all categories
// @access  Public
export const getCategories = async (
  req: Request,
  res: Response<{ categories: ICategoryWithSubcategories }>
) => {
  const categories = (await Category.find()
    .select("_id name")
    .populate({
      path: "subcategories",
      select: "_id name description",
    })
    .lean()) as ICategoryWithSubcategories;
  res.status(200).json({ categories });
};
