import { Request, Response } from "express";
import { Types } from "mongoose";
import { BadRequestError } from "../../errors/badRequestError.js";
import { NotFoundError } from "../../errors/notFoundError.js";
import { Category } from "../../models/categoryModel.js";
import { Subcategory } from "../../models/subcategoryModel.js";
import {
  ICreateSubcategoryRequestBody,
  ISubcategory,
  ISubcategoryWithCategory,
  IUpdateSubcategoryRequestBody,
} from "../../types/subcategory.types.js";

// @route   GET /api/admin/subcategory
// @desc    Get all subcategories
// @access  Private (Admin)
export const getSubCategories = async (
  req: Request,
  res: Response<{ subcategories: ISubcategoryWithCategory[] }>
) => {
  const subcategories = (await Subcategory.find()
    .populate({
      path: "category",
      select: "_id name",
    })
    .lean()) as ISubcategoryWithCategory[];

  res.status(200).json({ subcategories });
};

// @route   POST /api/admin/subcategory
// @desc    Create a subcategory
// @access  Private (Admin)
export const createSubcategory = async (
  req: Request<never, never, ICreateSubcategoryRequestBody>,
  res: Response<{ subcategory: ISubcategory }>
) => {
  const { name, description, categoryId } = req.body;

  const subcategory = await Subcategory.create({
    name,
    description,
    category: categoryId,
  });

  res.status(201).json({ subcategory });
};

// @route   PATCH /api/admin/subcategory/:id
// @desc    Update a subcategory
// @access  Private
export const updateSubcategory = async (
  req: Request<{ id: string }, never, IUpdateSubcategoryRequestBody>,
  res: Response<{ subcategory: ISubcategoryWithCategory }>
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

  res.status(200).json({ subcategory: subcategory.toObject() });
};

// @route   DELETE /api/category/subcategory/:id
// @desc    Delete a subcategory
// @access  Private
export const deleteSubcategory = async (
  req: Request<{ id: string }>,
  res: Response<{ id: Types.ObjectId }>
) => {
  const { id } = req.params;

  const subcategory = await Subcategory.findById(id);

  if (!subcategory) {
    throw new BadRequestError("Subcategory not found");
  }

  await subcategory.remove();

  res.status(200).json({ id: subcategory._id });
};
