import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
