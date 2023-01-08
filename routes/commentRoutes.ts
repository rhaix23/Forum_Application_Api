import { Router } from "express";
import {
  createComment,
  deleteComment,
  getSinglePostComments,
  getUserComments,
  updateComment,
} from "../controllers/commentController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

router.route("/").post(verifyAuth, createComment);

router
  .route("/:id")
  .patch(verifyAuth, updateComment)
  .delete(verifyAuth, deleteComment);

router.get("/post/:id", getSinglePostComments);

router.get("/user/:id", getUserComments);

export { router as commentRouter };
