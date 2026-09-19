import { Router } from "express";
import {
  changeCurrentPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAvatarImage,
  updateUserInfo,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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
router.route("/refresh-token").post(refreshAccessToken);

//protected Routes
router.route("/logout").post(verifyJWT, logoutUser);
router
  .route("/change-current-password")
  .patch(verifyJWT, changeCurrentPassword);

router.route("/update-user-details").patch(verifyJWT, updateUserInfo);
router
  .route("/update-avatar-image")
  .patch(upload.single("avatar"), verifyJWT, updateAvatarImage);

export default router;
