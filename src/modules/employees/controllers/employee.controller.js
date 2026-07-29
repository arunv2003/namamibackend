import employeeService from "../service/employee.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  loginEmployeeSchema
} from "../validations/employee.validation.js";


import cache from "../../../core/utils/cache.js";

export const createEmployee = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = createEmployeeSchema.parse(req.body);

  const employee = await employeeService.createEmployee(data, userId);
  return res
    .status(201)
    .json(new ApiResponse(201, employee, "Employee created successfully"));
});

export const getEmployeeFields = asyncHandler(async (req, res) => {
  const fields = await employeeService.getEmployeeFields();
  return res
    .status(200)
    .json(new ApiResponse(200, fields, "Employee form fields retrieved successfully"));
});


export const getEmployees = asyncHandler(async (req, res) => {
  const result = await employeeService.getEmployees(req.query, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Employees retrieved successfully"));
});

export const getEmployeeContactWithCustomer = asyncHandler(async (req, res) => {
  const result = await employeeService.getEmployeeContactWithCustomer(req.query, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Employee contacts retrieved successfully"));
});


export const getEmployeeBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Slug is required");
  }
  const employee = await employeeService.getEmployeeBySlug(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, employee, "Employee retrieved successfully"));
});


export const updateEmployee = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = updateEmployeeSchema.parse(req.body);
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Slug is required");
  }

  const updatedEmployee = await employeeService.updateEmployee(slug, data, userId);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedEmployee, "Employee updated successfully"));
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Slug is required");
  }
  await employeeService.deleteEmployee(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Employee deleted successfully"));
});


export const loginEmployee = asyncHandler(async (req, res) => {
  const data = loginEmployeeSchema.parse(req.body);

  const { user, accessToken, refreshToken, options } = await employeeService.loginEmployee(data);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options.accessCookieOptions)
    .cookie("refreshToken", refreshToken, options.refreshCookieOptions)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "Employee logged in successfully"
      )
    );
});


export const getPermissionByRole = asyncHandler(async (req, res) => {
  const role_id = req.user?.type || req.roleId;
  console.log(role_id);
  if (!role_id) {
    throw new ApiError(400, "Role ID is required");
  }
  const permissions = await employeeService.getPermissionByRole(role_id);
  return res
    .status(200)
    .json(new ApiResponse(200, permissions, "Permissions retrieved successfully"));
});

export const logoutEmployee = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { options } = await employeeService.logoutEmployee(id);
  return res
    .status(200)
    .clearCookie("accessToken", options.accessCookieOptions)
    .clearCookie("refreshToken", options.refreshCookieOptions)
    .json(
      new ApiResponse(
        200,
        null,
        "Employee logged out successfully"
      )
    );
});