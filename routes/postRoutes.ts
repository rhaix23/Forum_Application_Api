import { Router } from "express";
import {
  createPost,
  getSubcategoryPosts,
  updatePost,
  getSinglePost,
  getUserPosts,
  removePost,
} from "../controllers/postController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();

router.route("/").post(verifyAuth, createPost);
router.route("/:id").get(getSinglePost).patch(verifyAuth, updatePost);
router.get("/subcategory/:id", getSubcategoryPosts);
router.get("/user/:id", getUserPosts);
router.patch("/remove/:id", verifyAuth, removePost);

export { router as postRouter };
