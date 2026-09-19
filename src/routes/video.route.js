import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getAllVideos, uploadVideo } from "../controllers/video.controllers.js";

const router = Router();

// protected routes
router
  .route("/upload-video")
  .post(upload.single("videoFile"), verifyJWT, uploadVideo);

router.route("/get-all-videos").get(getAllVideos)
export default router;
