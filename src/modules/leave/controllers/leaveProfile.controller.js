import leaveProfileService from "../services/leaveProfile.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import {
  createLeaveProfileSchema,
  updateLeaveProfileSchema,
} from "../validations/leaveProfile.validation.js";

export const createLeaveProfile = asyncHandler(async (req, res) => {
  const data = createLeaveProfileSchema.parse(req.body);
  const userId = req.user?.id;
  const leaveProfile = await leaveProfileService.createLeaveProfile(data, userId);
  return res
    .status(201)
    .json(new ApiResponse(201, leaveProfile, "Leave profile created successfully"));
});

export const getAllLeaveProfiles = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await leaveProfileService.getAllLeaveProfiles(req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leave profiles retrieved successfully"));
});

export const getLeaveProfileBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Leave profile identifier is required");
  }
  const leaveProfile = await leaveProfileService.getLeaveProfileBySlug(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, leaveProfile, "Leave profile retrieved successfully"));
});

export const updateLeaveProfile = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Leave profile identifier is required");
  }
  const data = updateLeaveProfileSchema.parse(req.body);
  const userId = req.user?.id;
  const updatedLeaveProfile = await leaveProfileService.updateLeaveProfile(slug, data, userId);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedLeaveProfile, "Leave profile updated successfully"));
});

export const deleteLeaveProfile = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Leave profile identifier is required");
  }
  await leaveProfileService.deleteLeaveProfile(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Leave profile deleted successfully"));
});
