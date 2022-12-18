import { Request, Response } from "express";
import { Subcategory } from "../models/subcategoryModel.js";
import { BadRequestError } from "../errors/badRequestError.js";
import { ISubcategory } from "../types/subcategory.types.js";

// @route   GET /api/category
// @desc    Get all subcategories
// @access  Public
export const getSubCategories = async (
  req: Request,
  res: Response<{ subcategories: ISubcategory[] }>
) => {
  const subcategories = await Subcategory.find({});
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
  res: Response<{ subcategory: ISubcategory }>
) => {
  const { name, description, categoryId } = req.body;

  const subcategoryExists = await Subcategory.findOne({ name });

  if (subcategoryExists) {
    throw new BadRequestError("Subcategory already exists");
  }

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
  req: Request<{ id: string }, never, { name: string; description: string }>,
  res: Response<{ subcategory: ISubcategory }>
) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const subcategory = await Subcategory.findById(id);

  if (!subcategory) {
    throw new BadRequestError("Subcategory not found");
  }

  subcategory.name = name;
  subcategory.description = description;
  await subcategory.save();

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
    throw new BadRequestError("Subcategory not found");
  }

  await subcategory.remove();

  res.sendStatus(200);
};
