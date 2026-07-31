import regionService from "../services/region.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import {
  createRegionSchema,
  updateRegionSchema,
} from "../validations/region.validation.js";

export const createRegion = asyncHandler(async (req, res) => {
  const data = createRegionSchema.parse(req.body);
  const region = await regionService.createRegion(data, req.user?.id);
  return res
    .status(201)
    .json(new ApiResponse(201, region, "Region created successfully"));
});

export const getRegions = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await regionService.getRegions(req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Regions retrieved successfully"));
});

export const getRegionBySlug = asyncHandler(async (req, res) => {
  const region = await regionService.getRegionBySlug(req.params.slug);
  return res
    .status(200)
    .json(new ApiResponse(200, region, "Region retrieved successfully"));
});
export const getRegionByStateId = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await regionService.getRegionByStateId(req.params.stateId, req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Region retrieved successfully"));
});


export const updateRegion = asyncHandler(async (req, res) => {
  const data = updateRegionSchema.parse(req.body);
  const updatedRegion = await regionService.updateRegion(req.params.slug, data, req.user?.id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRegion, "Region updated successfully"));
});

export const deleteRegion = asyncHandler(async (req, res) => {
  await regionService.deleteRegion(req.params.slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Region deleted successfully"));
});
