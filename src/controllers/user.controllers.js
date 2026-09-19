import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  // get user from req.body
  const { fullName, email, username, password } = req.body;

  // check all field whether they are empty or not
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are Required");
  }

  // check if user already exists or not
  const alreadyExistsOrNot = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (alreadyExistsOrNot) {
    throw new ApiError(400, "User already exists with this email or username");
  }

  // check for avatar and cover image
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  // console.log(coverImageLocalPath);

  // console.log(avatar);

  if (!avatarLocalPath) {
    throw new ApiError(402, "Avatar is required");
  }

  // upload avatar and coverImage to cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // console.log(avatar);

  if (!avatar) {
    throw new ApiError(402, "Avatar is required");
  }

  //create a user object and save it to database
  const createdUser = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // check if user created or not and remove password and refreshToken
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong...");
  }

  const userReponse = await User.findById(createdUser._id).select(
    "-password -refreshToken"
  );

  // finally return the response
  return res
    .status(200)
    .json(new ApiResponse(201, userReponse, "User Created Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get user details
  const { username, email, password } = req.body;

  if (
    [username, email, password].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "Username, email, and password are all required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    path: "/",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Sucessfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      returnDocument: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    path: "/",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "user logged out successfully"));
  ``;
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refresh token from browers
  const browserSavedRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  // checking if the token is there or not
  if (!browserSavedRefreshToken) {
    throw new ApiError(401, "Refresh Token is used or expired");
  }

  // decoding and fetching the payload in that token
  const decodedToken = await jwt.verify(
    browserSavedRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  // querying database to get user from token information or payload
  const user = await User.findById(decodedToken?._id);

  //checking if user exists or not
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // checking if the token from browser is equals to the database saved token or not
  if (browserSavedRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }

  // generating both tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id
  );

  // options for cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  // returning response and setting cookies to browser
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "Access token refreshed"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // getting old password and new password from user
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword || newPassword)) {
    throw new ApiError(400, "All fields are required");
  }

  const currentUser = await User.findById(req.user?._id);

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await currentUser.isPasswordCorrect(oldPassword);
   
  
  if(!isPasswordCorrect){
    throw new ApiError(400,"Incorrect Password");
  }

  currentUser.password = newPassword;

  await currentUser.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});



export { registerUser, loginUser, logoutUser, refreshAccessToken,changeCurrentPassword};
