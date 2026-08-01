import leaveService from "../services/leave.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import {
  applyLeaveSchema,
  updateLeaveSchema,
  actionLeaveSchema,
} from "../validations/leave.validation.js";

export const applyLeave = asyncHandler(async (req, res) => {
  const data = applyLeaveSchema.parse(req.body);
  const userId = req.user?.id;
  const leave = await leaveService.applyLeave(data, userId);
  return res
    .status(201)
    .json(new ApiResponse(201, leave, "Leave applied successfully"));
});

export const getAllLeaves = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await leaveService.getAllLeaves(req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leaves retrieved successfully"));
});

export const getLeaveById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Leave ID is required");
  }
  const leave = await leaveService.getLeaveById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, leave, "Leave details retrieved successfully"));
});

export const updateLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Leave ID is required");
  }
  const data = updateLeaveSchema.parse(req.body);
  const userId = req.user?.id;
  const updatedLeave = await leaveService.updateLeave(id, data, userId);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedLeave, "Leave updated successfully"));
});

export const actionOnLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Leave ID is required");
  }
  const data = actionLeaveSchema.parse(req.body);
  const actionByUserId = req.user?.id;
  const actionedLeave = await leaveService.actionOnLeave(id, data, actionByUserId);
  return res
    .status(200)
    .json(new ApiResponse(200, actionedLeave, `Leave ${data.status} successfully`));
});

export const deleteLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Leave ID is required");
  }
  await leaveService.deleteLeave(id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Leave deleted successfully"));
});
