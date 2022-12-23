import { Router } from "express";
import {
  createPost,
  deletePost,
  getSubcategoryPosts,
  getPosts,
  updatePost,
  getSinglePost,
  getUserPosts,
  removePost,
} from "../controllers/postController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

router.route("/").get(verifyRole, getPosts).post(verifyAuth, createPost);

router
  .route("/:id")
  .get(getSinglePost)
  .patch(verifyAuth, updatePost)
  .delete(verifyAuth, deletePost);

router.get("/subcategory/:id", getSubcategoryPosts);

router.get("/user/:id", getUserPosts);

router.patch("/remove/:id", verifyAuth, removePost);

export { router as postRouter };
