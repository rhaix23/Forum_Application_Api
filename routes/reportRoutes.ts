import { Router } from "express";
import { submitReport } from "../controllers/reportController.js";
import { reportLimiter } from "../middleware/rateLimiter.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
const router = Router();

router.route("/").post([verifyAuth, reportLimiter], submitReport);

export { router as reportRouter };
