import { Request, Response } from "express";
import { Types } from "mongoose";
import { BadRequestError } from "../../errors/badRequestError.js";
import { Category } from "../../models/categoryModel.js";
import {
  ICategory,
  ICategoryWithSubcategories,
} from "../../types/category.types";

// @route   GET /api/admin/category
// @desc    Get all categories
// @access  Private (admin)
export const getCategories = async (
  req: Request,
  res: Response<{ categories: ICategoryWithSubcategories[] }>
) => {
  const categories = (await Category.find()
    .select("_id name")
    .populate({
      path: "subcategories",
      select: "_id name description",
    })
    .lean()) as ICategoryWithSubcategories[];

  res.status(200).json({ categories });
};

// @route   POST /api/admin/category
// @desc    Create a category
// @access  Private (admin)
export const createCategory = async (
  req: Request<never, never, { name: string }>,
  res: Response<{ category: ICategory }>
) => {
  const { name } = req.body;
  const category = await Category.create({ name });
  res.status(201).json({ category });
};

// @route   PATCH /api/admin/category/:id
// @desc    Update a category
// @access  Private
export const updateCategory = async (
  req: Request<{ id: string }, never, { name: string }>,
  res: Response<{ category: ICategoryWithSubcategories }>
) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findById(id).populate({
    path: "subcategories",
    select: "_id name description",
  });

  if (!category) {
    throw new BadRequestError("Category not found");
  }

  category.name = name;
  await category.save();

  res.status(200).json({ category: category.toObject() });
};

// @route   DELETE /api/admin/category/:id
// @desc    Delete a category
// @access  Private
export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response<{ id: Types.ObjectId }>
) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    throw new BadRequestError("Category not found");
  }

  await category.remove();

  res.status(200).json({ id: category._id });
};
