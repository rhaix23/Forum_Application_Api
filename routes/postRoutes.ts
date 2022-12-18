import { Router } from "express";
import {
  createPost,
  deletePost,
  getSubcategoryPosts,
  getPosts,
  updatePost,
  getSinglePost,
  getUserPosts,
} from "../controllers/postController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();

router.route("/").get(getPosts).post(verifyAuth, createPost);

router
  .route("/:id")
  .get(getSinglePost)
  .patch(verifyAuth, updatePost)
  .delete(verifyAuth, deletePost);

router.get("/subcategory/:id", getSubcategoryPosts);

router.get("/user/:id", getUserPosts);

export { router as postRouter };
