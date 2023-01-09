import { Router } from "express";
import { submitReport } from "../controllers/reportController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
const router = Router();

router.route("/").post(verifyAuth, submitReport);

export { router as reportRouter };
