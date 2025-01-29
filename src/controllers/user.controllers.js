import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import cloudinaryUpload from "../services/cloudinary.service.js";
import User from "../models/user.model.js";

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
  if (!avatarFilePath) throw new ApiError(400, "Avatar image required!!");

  // Upload files cloudinary
  const avatar = await cloudinaryUpload(avatarFilePath);
  const coverImage = coverImageFilePath
    ? await cloudinaryUpload(coverImageFilePath)
    : null;

  console.log("coverImage URL", coverImage?.url);

  // validate avatar file
  if (!avatar) throw new ApiError(400, "Avatar image required!!");

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
