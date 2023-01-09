import { Router } from "express";
import {
  deleteReport,
  getReports,
  updateReport,
} from "../../controllers/admin/adminReportController.js";
const router = Router();

router.route("/").get(getReports);
router.route("/:id").patch(updateReport).delete(deleteReport);

export { router as adminReportRouter };
