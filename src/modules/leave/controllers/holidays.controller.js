import holidaysService from "../services/holidays.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import {
  createHolidaySchema,
  updateHolidaySchema,
} from "../validations/holidays.validation.js";

export const createHoliday = asyncHandler(async (req, res) => {
  const data = createHolidaySchema.parse(req.body);
  const userId = req.user?.id;
  const holiday = await holidaysService.createHoliday(data, userId);
  return res
    .status(201)
    .json(new ApiResponse(201, holiday, "Holiday created successfully"));
});

export const getAllHolidays = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await holidaysService.getAllHolidays(req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Holidays retrieved successfully"));
});

export const getHolidayBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Holiday identifier is required");
  }
  const holiday = await holidaysService.getHolidayBySlug(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, holiday, "Holiday retrieved successfully"));
});

export const updateHoliday = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Holiday identifier is required");
  }
  const data = updateHolidaySchema.parse(req.body);
  const userId = req.user?.id;
  const updatedHoliday = await holidaysService.updateHoliday(slug, data, userId);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedHoliday, "Holiday updated successfully"));
});

export const deleteHoliday = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Holiday identifier is required");
  }
  await holidaysService.deleteHoliday(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Holiday deleted successfully"));
});
