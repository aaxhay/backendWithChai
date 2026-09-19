import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
  // getting video file from req.file
  const { title, description } = req.body;
  const videoFile = req.file;

  if (!(title || description)) {
    throw new ApiError(400, "all fields are required");
  }

  // checking if we are actually getting the video file or not
  if (!videoFile) throw new ApiError(400, "Video file is required");

  try {
    // getting file path from req.file
    const videoFilePath = req.file?.path;

    // checking if we have the file path or not
    if (!videoFilePath) throw new ApiError(400, "Video file path is not there");

    // uploading video on cloudinary and storing the response of it
    const videoFileResponse = await uploadOnCloudinary(videoFilePath, "video");

    // checking if cloudinary response have some issues or not
    if (!videoFileResponse) {
      throw new ApiError(
        400,
        "Cloudinary upload got some issues uploading the file"
      );
    }

    // creating a video object and saving it on mongodb database
    const videoCreated = await Video.create({
      title,
      description,
      videoFile: videoFileResponse?.url,
      owner: req.user?._id,
      duration: videoFileResponse.duration,
    });

    // checking that video which we have created has any issues or not
    if (!videoCreated)
      throw new ApiError(
        500,
        "Something went wrong while uploading the video schema to database"
      );

    // returning response finally with videoCreated Object
    return res
      .status(201)
      .json(new ApiResponse(201, videoCreated, "video created successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "something went wrong :: video controller -> upload vidoe"
    );
  }
});

const getAllVideos = asyncHandler(async (req, res) => {
  const allVideos = await Video.find();
  
  if (allVideos.length === 0) {
    throw new ApiError(404, "No Videos as of now");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "All Videos Fetched"));
});

export { uploadVideo, getAllVideos };
