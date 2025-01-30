import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import User from "../models/user.model";
import jwt from "jsonwebtoken";

export const verifyToken = asyncHandler(async (req, _, next) => {
  try {
    // Retrieve and verify access token
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.split("Bearer ")[1];

    if (!token) throw new ApiError(401, "Unauthorized request!");
    const decryptedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Verify user
    const user = await User.findById(decryptedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) throw new ApiError(401, "Invalid access token!");
    req.user = user;
    next();
  } catch (error) {
    throw new Api(401, "Invalid access token!");
  }
});
