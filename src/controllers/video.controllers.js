import { response } from "express";
import { User } from "../models/user.models.js";
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

const deleteVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(404, "video id is required");
  }

  const videoById = await Video.findById(videoId);

  if (!videoById) {
    throw new ApiError(404, "Video doesn't exist");
  }

  if (videoById.owner?._id.toString() !== req.user?._id.toString()) {
    throw new ApiError(401, "You are not authorized to deleted this video");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deleteVideoById) {
    throw new ApiError(501, "Error while deleting the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video Deleted successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(404, "video id is required");
  }

  const videoById = await Video.findById(videoId);

  if (!videoById) {
    throw new ApiError(404, "Video doesn't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoById, "Video Fetched successfully"));
});

const viewVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(404, "video id is required");
  }

  const videoById = await Video.findById(videoId);

  if (!videoById) {
    throw new ApiError(404, "Video doesn't exist");
  }

  const watchHistoryUpdated = await User.findByIdAndUpdate(req.user?._id, {
    $push: {
      watchHistory: videoById,
    },
  }).select("-password -refreshToken");

  if (!watchHistoryUpdated) {
    throw new ApiError(400, "Error while pushing video to watch history");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoById, "Video watched successfully"));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  // take the information via req.body;
  const { title, description } = req.body;
  const { videoId } = req.params;

  //checking that these fields exists or not
  if (!(title || description)) {
    throw new ApiError(400, "All fields are required");
  }

  if (!videoId) throw new ApiError(400, "Video id is required");

  const videoById = await Video.findById(videoId);

  if (!videoById) throw new ApiError(404, "Video not Found");

  // checking if user is authorized to make changes or update the file or not
  if (videoById.owner?._id.toString() !== req.user?._id.toString()) {
    throw new ApiError(401, "Not authorized to use this operation");
  }

  //we are query again or we can make changes to the existing videoById too
  videoById.title = title;
  videoById.description = description;
  await videoById.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoById, "Video Details Updated Successfully")
    );
});



export {
  uploadVideo,
  getAllVideos,
  viewVideo,
  getVideoById,
  deleteVideoById,
  updateVideoDetails,
};
