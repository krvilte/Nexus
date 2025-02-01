import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").post(verifyToken, logoutUser);
router.route("/refresh-token").post(verifyToken, refreshAccessToken);
router.route("/change-password").post(verifyToken, changePassword);
router.route("/current-user").post(verifyToken, getCurrentUser);
router.route("/update-account").post(verifyToken, updateAccountDetails);

router.route("/avatar").post(
  verifyToken,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  updateAvatar
);
router.route("/cover-image").post(
  verifyToken,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  updateCoverImage
);

export default router;
