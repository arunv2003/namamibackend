import taskTypeService from "../services/task.type.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import {
  createTaskTypeSchema,
  updateTaskTypeSchema,
} from "../validations/task.type.validation.js";

export const createTaskType = asyncHandler(async (req, res) => {
  const data = createTaskTypeSchema.parse(req.body);
  const taskType = await taskTypeService.createTaskType(data, req.user?.id);
  return res
    .status(201)
    .json(new ApiResponse(201, taskType, "Task type created successfully"));
});

export const getAllTaskTypes = asyncHandler(async (req, res) => {
  const result = await taskTypeService.getAllTaskTypes(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Task types retrieved successfully"));
});

export const getTaskTypeBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Task type identifier is required");
  }
  const taskType = await taskTypeService.getTaskTypeBySlug(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, taskType, "Task type retrieved successfully"));
});

export const updateTaskType = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Task type identifier is required");
  }
  const data = updateTaskTypeSchema.parse(req.body);
  const updatedTaskType = await taskTypeService.updateTaskType(slug, data, req.user?.id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTaskType, "Task type updated successfully"));
});

export const deleteTaskType = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Task type identifier is required");
  }
  await taskTypeService.deleteTaskType(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Task type deleted successfully"));
});
