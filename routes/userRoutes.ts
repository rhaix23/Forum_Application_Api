import { Router } from "express";
import {
  register,
  getUsers,
  deleteUser,
  login,
  handleRefreshToken,
  logout,
  me,
  updateUser,
  changePassword,
  getSingleUser,
} from "../controllers/userController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

router.get("/refresh", handleRefreshToken);

router.get("/me", verifyAuth, me);

router.route("/").get(verifyRole, getUsers);

router
  .route("/:id")
  .get(getSingleUser)
  .patch(verifyAuth, updateUser)
  .delete(verifyRole, deleteUser);

router.post("/logout", logout);

router.post("/register", register);

router.post("/login", login);

router.post("/changepassword", verifyAuth, changePassword);

export { router as userRouter };
