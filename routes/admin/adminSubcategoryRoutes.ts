import { Router } from "express";
import {
  createSubcategory,
  deleteSubcategory,
  getSubCategories,
  updateSubcategory,
} from "../../controllers/admin/adminSubcategoryController.js";

const router = Router();

router.route("/").get(getSubCategories).post(createSubcategory);
router.route("/:id").patch(updateSubcategory).delete(deleteSubcategory);

export { router as adminSubcategoryRouter };
