import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

router.route("/").get(getCategories).post(verifyRole, createCategory);

router
  .route("/:id")
  .patch(verifyRole, updateCategory)
  .delete(verifyRole, deleteCategory);

export { router as categoryRouter };
