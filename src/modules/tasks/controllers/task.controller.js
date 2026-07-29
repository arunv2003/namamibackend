import taskService from "../services/task.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validations/task.validation.js";
import { RoleSchema } from "../../roles/models/role.model.js";

export const getCreateTaskForm = asyncHandler(async (req, res) => {
  let roleSlug = req.roleSlug;
  if (!roleSlug && (req.user?.type || req.roleId)) {
    const role = await RoleSchema.findByPk(req.user.type || req.roleId);
    roleSlug = role?.slug;
  }

  const data = await taskService.getCreateTaskForm(roleSlug);
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Task form retrieved successfully"));
});

export const createTask = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = createTaskSchema.parse(req.body);
  const task = await taskService.createTask(data, userId);

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  if (!taskId) {
    throw new ApiError(400, "Task identifier is required");
  }

  const data = updateTaskSchema.parse(req.body);
  const userId = req.user.id;
  const updatedTask = await taskService.updateTask(taskId, data, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  if (!taskId) {
    throw new ApiError(400, "Task identifier is required");
  }

  await taskService.deleteTask(taskId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Task deleted successfully"));
});

export const getTaskBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Task identifier is required");
  }

  const task = await taskService.getTaskBySlug(slug);

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task retrieved successfully"));
});

export const getAllTasks = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const roleId = req.user.type || req.roleId;
  const result = await taskService.getAllTasks(req.query, userId, roleId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Tasks retrieved successfully"));
});

export const getCustomerTasks = asyncHandler(async (req, res) => {

  const result = await taskService.getCustomerTasks(req.query, req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Customer tasks retrieved successfully"));
});

export const getEmployeeTasks = asyncHandler(async (req, res) => {
  const employeeId = req.query.employeeId || req.params.employeeId || req.user?.id || req.user?.emp_id;

  console.log(employeeId, "employeeId received in getEmployeeTasks controller");
  if (!employeeId) {
    throw new ApiError(400, "Employee ID is required");
  }

  const result = await taskService.getEmployeeTasks(employeeId, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Employee tasks retrieved successfully"));
});