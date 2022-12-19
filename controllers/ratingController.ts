import { Request, Response } from "express";
import { BadRequestError } from "../errors/badRequestError.js";
import { Rating } from "../models/ratingModel.js";
import { IRating } from "../types/rating.types.js";

//@desc Get user ratings
//@route GET /api/ratings/user/:id
//@access Public
export const getSingleUserRatings = async (
  req: Request<{ id: string }>,
  res: Response<{ ratings: IRating[] }>
) => {
  const ratings = await Rating.find({ user: req.params.id });
  res.status(200).json({ ratings });
};

//@desc Rate post
//@route POST /api/ratings
//@access Private
export const ratePost = async (
  req: Request<never, never, { postId: string; value: number }>,
  res: Response
) => {
  const { postId, value } = req.body;

  const ratingExists = await Rating.findOne({
    user: req.user!.userId,
    post: postId,
  });

  if (ratingExists) {
    throw new BadRequestError("Rating already exists");
  }

  const rating = await Rating.create({
    user: req.user!.userId,
    post: postId,
    value,
  });

  res.sendStatus(201);
};

//@desc Update rating
//@route PATCH /api/ratings/:id
//@access Private
export const updateRating = async (
  req: Request<{ id: string }, never, { value: number }>,
  res: Response
) => {
  const { id } = req.params;
  const { value } = req.body;

  const rating = await Rating.findById(id);

  if (!rating) {
    throw new BadRequestError("Rating not found");
  }

  if (rating.value === value) {
    throw new BadRequestError("Rating already exists");
  }

  rating.value = value;
  await rating.save();

  res.sendStatus(200);
};

//@desc Delete rating
//@route DELETE /api/ratings/:id
//@access Private
export const deleteRating = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;

  const rating = await Rating.findById(id);

  if (!rating) {
    throw new BadRequestError("Rating not found");
  }

  await rating.remove();

  res.sendStatus(200);
};
