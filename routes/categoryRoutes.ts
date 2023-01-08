import { Router } from "express";
import { getCategories } from "../controllers/categoryController.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

router.route("/").get(getCategories);

export { router as categoryRouter };
