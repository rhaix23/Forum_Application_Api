import { Router } from "express";
import {
  deleteUser,
  getUsers,
  updateStatus,
  updateUser,
} from "../../controllers/admin/adminUserController.js";

const router = Router();

router.route("/:id").patch(updateUser).delete(deleteUser);
router.route("/").get(getUsers);
router.route("/status/:id").patch(updateStatus);

export { router as adminUserRouter };
