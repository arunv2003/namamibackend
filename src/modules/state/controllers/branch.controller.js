import branchService from "../services/branch.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import {
  createBranchSchema,
  updateBranchSchema,
} from "../validations/branch.validation.js";

export const createBranch = asyncHandler(async (req, res) => {
  const data = createBranchSchema.parse(req.body);
  const branch = await branchService.createBranch(data, req.user?.id);
  return res
    .status(201)
    .json(new ApiResponse(201, branch, "Branch created successfully"));
});

export const getBranches = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await branchService.getBranches(req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Branches retrieved successfully"));
});

export const getBranchBySlug = asyncHandler(async (req, res) => {
  const branch = await branchService.getBranchBySlug(req.params.slug);
  return res
    .status(200)
    .json(new ApiResponse(200, branch, "Branch retrieved successfully"));
});
export const getBranchByRegionId = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await branchService.getBranchByRegionId(req.params.regionId, req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Branch retrieved successfully"));
});

export const updateBranch = asyncHandler(async (req, res) => {
  const data = updateBranchSchema.parse(req.body);
  const updatedBranch = await branchService.updateBranch(req.params.slug, data, req.user?.id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedBranch, "Branch updated successfully"));
});

export const deleteBranch = asyncHandler(async (req, res) => {
  await branchService.deleteBranch(req.params.slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Branch deleted successfully"));
});
