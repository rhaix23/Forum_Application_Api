import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../controllers/admin/adminCategoryController.js";

const router = Router();

router.route("/").get(getCategories).post(createCategory);
router.route("/:id").patch(updateCategory).delete(deleteCategory);

export { router as adminCategoryRouter };
