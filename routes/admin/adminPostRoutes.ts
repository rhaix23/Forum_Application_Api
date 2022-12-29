import { Router } from "express";
import {
  deletePost,
  getPosts,
  removePost,
  updatePost,
} from "../../controllers/admin/adminPostController.js";

const router = Router();

router.route("/").get(getPosts);
router.route("/:id").patch(updatePost).delete(deletePost);
router.patch("/remove/:id", removePost);

export { router as adminPostRouter };
