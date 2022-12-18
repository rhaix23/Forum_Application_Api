import { Router } from "express";
import {
  deleteRating,
  getSingleUserRatings,
  ratePost,
  updateRating,
} from "../controllers/ratingController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();

router.route("/").post(verifyAuth, ratePost);

router
  .route("/:id")
  .post(verifyAuth, ratePost)
  .patch(verifyAuth, updateRating)
  .delete(verifyAuth, deleteRating);

router.route("/user/:id").get(getSingleUserRatings);

export { router as ratingRouter };
