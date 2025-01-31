import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import cloudinaryUpload from "../services/cloudinary.service.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;
  const avatarFilePath = req.files?.avatar[0]?.path;
  const coverImageFilePath = req.files?.coverImage[0]?.path;

  // Validate user inputs
  if (!fullName && !username && !email && !password)
    throw new ApiError(400, "All fields are required");

  // Check for existing user
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser)
    throw new ApiError(409, "User with username or email already exists");

  // validate avatar file
  if (!avatarFilePath) throw new ApiError(400, "Avatar image required");

  // Upload files cloudinary
  const avatar = await cloudinaryUpload(avatarFilePath);
  const coverImage = coverImageFilePath
    ? await cloudinaryUpload(coverImageFilePath)
    : null;

  // validate avatar file
  if (!avatar) throw new ApiError(400, "Avatar image required");

  // Creating user
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // Find registered User
  const registeredUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Validate registered user
  if (!registeredUser) throw new ApiError(500, "Error while registering user");

  // Success response
  return res
    .status(201)
    .json(new ApiResponse(200, "User registered successfully", registeredUser));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate username and email
  if (!username && !email)
    throw new ApiError(400, "Username or email is required");

  // Find and validate existing user
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (!existingUser) throw new ApiError(404, "User does not exist");

  // Validate password
  const correctPassword = await existingUser.isCorrectPassword(password);
  if (!correctPassword) throw new ApiError(401, "Incorrect password");

  // Generate access and refresh token
  const accessToken = await existingUser.generateAccessToken();
  const refreshToken = await existingUser.generateRefreshToken();

  existingUser.refreshToken = refreshToken;
  await existingUser.save({ validateBeforeSave: false });

  // Send cookies
  const loggedInUser = await User.findOne(existingUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logout successfully!"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken = cookies?.refreshToken || req.body.refreshToken;

    // Validate incoming refresh token
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");
    const decryptedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find user and validate refresh token
    const user = await User.findById(decryptedToken?._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");
    if (incomingRefreshToken !== decryptedToken)
      throw new ApiError(401, "Expired refresh token");

    // Generate new access token
    const newAccessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // Send new access token
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "Access token renewed", {
          accessToken: newAccessToken,
          refreshToken: refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Find and validate user
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(404, "User not found");

  // Validate old password
  const isCorrectPassword = await user.isCorrectPassword(oldPassword);
  if (!isCorrectPassword) throw new ApiError(400, "Incorrect old password");

  // Update the password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, "Password changed successfully"));
});
