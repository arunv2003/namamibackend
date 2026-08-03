import nonWorkingService from "../services/nonworking.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import {
  createNonWorkingDaySchema,
  updateNonWorkingDaySchema,
} from "../validations/nonworking.validation.js";

export const createNonWorkingDay = asyncHandler(async (req, res) => {
  const data = createNonWorkingDaySchema.parse(req.body);
  const userId = req.user?.id;
  const nonWorkingDay = await nonWorkingService.createNonWorkingDay(data, userId);
  return res
    .status(201)
    .json(new ApiResponse(201, nonWorkingDay, "Non-working day created successfully"));
});

export const getAllNonWorkingDays = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await nonWorkingService.getAllNonWorkingDays(req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Non-working days retrieved successfully"));
});

export const getNonWorkingDayById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Non-working day ID is required");
  }
  const nonWorkingDay = await nonWorkingService.getNonWorkingDayById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, nonWorkingDay, "Non-working day retrieved successfully"));
});

export const updateNonWorkingDay = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Non-working day ID is required");
  }
  const data = updateNonWorkingDaySchema.parse(req.body);
  const userId = req.user?.id;
  const updated = await nonWorkingService.updateNonWorkingDay(id, data, userId);
  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Non-working day updated successfully"));
});

export const deleteNonWorkingDay = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Non-working day ID is required");
  }
  await nonWorkingService.deleteNonWorkingDay(id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Non-working day deleted successfully"));
});
