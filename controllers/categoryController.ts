import { Request, Response } from "express";
import { BadRequestError } from "../errors/badRequestError.js";
import { Category } from "../models/categoryModel.js";
import { ICategory } from "../types/category.types.js";

// @route   GET /api/category
// @desc    Get all categories
// @access  Public
export const getCategories = async (
  req: Request,
  res: Response<{ categories: ICategory[] }>
) => {
  const categories = await Category.find({}).populate({
    path: "subcategories",
    select: "-posts",
  });
  res.status(200).json({ categories });
};

// @route   POST /api/category
// @desc    Create a category
// @access  Private
export const createCategory = async (
  req: Request<never, never, { name: string }>,
  res: Response<{ category: ICategory }>
) => {
  const { name } = req.body;

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    throw new BadRequestError("Category already exists");
  }

  const category = await Category.create({ name });

  res.status(201).json({ category });
};

// @route   PATCH /api/category/:id
// @desc    Update a category
// @access  Private
export const updateCategory = async (
  req: Request<{ id: string }, never, { name: string }>,
  res: Response<{ category: ICategory }>
) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findById(id);

  if (!category) {
    throw new BadRequestError("Category not found");
  }

  category.name = name;
  await category.save();

  res.status(200).json({ category });
};

// @route   DELETE /api/category/:id
// @desc    Delete a category
// @access  Private
export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    throw new BadRequestError("Category not found");
  }

  await category.remove();

  res.sendStatus(200);
};
