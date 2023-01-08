import { Request, Response } from "express";
import { Subcategory } from "../models/subcategoryModel.js";
import { Types } from "mongoose";
import { Category } from "../models/categoryModel.js";
import { NotFoundError } from "../errors/notFoundError.js";

// @route   GET /api/category
// @desc    Get all subcategories
// @access  Public
export const getSubCategories = async (req: Request, res: Response) => {
  const subcategories = await Subcategory.find()
    .select("_id name description allowUsersToPost")
    .populate({
      path: "category",
      select: "_id name",
    })
    .lean();

  res.status(200).json({ subcategories });
};

// @route   POST /api/category/subcategory
// @desc    Create a subcategory
// @access  Private
export const createSubcategory = async (
  req: Request<
    never,
    never,
    { name: string; description: string; categoryId: string }
  >,
  res: Response
) => {
  const { name, description, categoryId } = req.body;

  const subcategory = await Subcategory.create({
    name,
    description,
    category: categoryId,
  });

  res.status(201).json({ subcategory });
};

// @route   PATCH /api/category/subcategory/:id
// @desc    Update a subcategory
// @access  Private
export const updateSubcategory = async (
  req: Request<
    { id: string },
    never,
    {
      name: string;
      description: string;
      categoryId: Types.ObjectId;
      allowUsersToPost: boolean;
    }
  >,
  res: Response
) => {
  const { id } = req.params;
  const { name, description, categoryId, allowUsersToPost } = req.body;

  const subcategory = await Subcategory.findById(id);

  if (!subcategory) {
    throw new NotFoundError("Subcategory not found");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  subcategory.name = name;
  subcategory.description = description;
  subcategory.category = categoryId;
  subcategory.allowUsersToPost = allowUsersToPost;
  await (
    await subcategory.save()
  ).populate({
    path: "category",
    select: "_id name",
  });

  res.status(200).json({ subcategory });
};

// @route   DELETE /api/category/subcategory/:id
// @desc    Delete a subcategory
// @access  Private
export const deleteSubcategory = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;

  const subcategory = await Subcategory.findById(id);

  if (!subcategory) {
    throw new NotFoundError("Subcategory not found");
  }

  await subcategory.remove();

  res.status(200).json({ id: subcategory._id });
};
