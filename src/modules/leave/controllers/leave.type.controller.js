import leaveTypeService from "../services/leave.type.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import {
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
} from "../validations/leave.type.validation.js";

export const createLeaveType = asyncHandler(async (req, res) => {
  const data = createLeaveTypeSchema.parse(req.body);
  const userId = req.user?.id;
  const leaveType = await leaveTypeService.createLeaveType(data, userId);
  return res
    .status(201)
    .json(new ApiResponse(201, leaveType, "Leave type created successfully"));
});

export const getAllLeaveTypes = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await leaveTypeService.getAllLeaveTypes(req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leave types retrieved successfully"));
});

export const getLeaveTypeBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Leave type identifier is required");
  }
  const leaveType = await leaveTypeService.getLeaveTypeBySlug(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, leaveType, "Leave type retrieved successfully"));
});

export const updateLeaveType = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Leave type identifier is required");
  }
  const data = updateLeaveTypeSchema.parse(req.body);
  const userId = req.user?.id;
  const updatedLeaveType = await leaveTypeService.updateLeaveType(slug, data, userId);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedLeaveType, "Leave type updated successfully"));
});

export const deleteLeaveType = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Leave type identifier is required");
  }
  await leaveTypeService.deleteLeaveType(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Leave type deleted successfully"));
});
