import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../controllers/admin/adminCategoryController.js";

const router = Router();

router.route("/").post(createCategory);
router.route("/:id").patch(updateCategory).delete(deleteCategory);

export { router as adminCategoryRouter };
