import { Router } from "express";
import {
  createSubcategory,
  deleteSubcategory,
  getSubCategories,
  updateSubcategory,
} from "../controllers/subcategoryController.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

router.route("/").get(getSubCategories).post(verifyRole, createSubcategory);

router
  .route("/:id")
  .patch(verifyRole, updateSubcategory)
  .delete(verifyRole, deleteSubcategory);

export { router as subcategoryRouter };
