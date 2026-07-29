import roleService from "../services/role.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import {
  createRoleSchema,
  updateRoleSchema
} from "../validations/role.validation.js";

export const createRole = asyncHandler(async (req, res) => {
  const data = createRoleSchema.parse(req.body);

  const role = await roleService.createRole(data, req.userId);
  return res
    .status(201)
    .json(new ApiResponse(201, role, "Role created successfully"));
});

export const getRoles = asyncHandler(async (req, res) => {
  const result = await roleService.getRoles(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Roles retrieved successfully"));
});

export const getRoleBySlug = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleBySlug(req.params.slug);
  return res
    .status(200)
    .json(new ApiResponse(200, role, "Role retrieved successfully"));
});

export const updateRole = asyncHandler(async (req, res) => {
  const data = updateRoleSchema.parse(req.body);

  const updatedRole = await roleService.updateRole(req.params.slug, data, req.userId);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRole, "Role updated successfully"));
});

export const deleteRole = asyncHandler(async (req, res) => {
  await roleService.deleteRole(req.params.slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Role deleted successfully"));
});
