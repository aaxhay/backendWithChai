import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideoById,
  getAllVideos,
  getVideoById,
  updateVideoDetails,
  uploadVideo,
  viewVideo,
} from "../controllers/video.controllers.js";

const router = Router();

router.route("/get-all-videos").get(getAllVideos);
router.route("/get-video-by-id/:videoId").get(getVideoById);

// protected routes
router
  .route("/upload-video")
  .post(upload.single("videoFile"), verifyJWT, uploadVideo);

router.route("/view-video/:videoId").get(verifyJWT, viewVideo);

router.route("/delete-video-by-id/:videoId").delete(verifyJWT, deleteVideoById);
router
  .route("/update-video-details/:videoId")
  .put(verifyJWT, updateVideoDetails);
export default router;
