import { Router } from "express";
import {
  deleteComment,
  getComments,
  updateComment,
} from "../../controllers/admin/adminCommentController.js";

const router = Router();

router.route("/").get(getComments);
router.route("/:id").patch(updateComment).delete(deleteComment);

export { router as adminCommentRouter };
