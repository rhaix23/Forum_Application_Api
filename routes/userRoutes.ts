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
  updateAccountStatus,
} from "../controllers/userController.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

router.post("/logout", logout);

router.get("/refresh", handleRefreshToken);

router.get("/me", verifyAuth, me);

router.route("/").get(verifyRole, getUsers);

router
  .route("/:id")
  .get(getSingleUser)
  .patch(verifyAuth, updateUser)
  .delete(verifyRole, deleteUser);

router.patch("/updatestatus/:id", verifyRole, updateAccountStatus);

router.post("/register", registerLimiter, register);

router.post("/login", loginLimiter, login);

router.post("/changepassword", verifyAuth, changePassword);

export { router as userRouter };
