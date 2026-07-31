import stateService from "../services/state.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import {
  createStateSchema,
  updateStateSchema,
} from "../validations/state.validation.js";

export const createState = asyncHandler(async (req, res) => {
  const data = createStateSchema.parse(req.body);
  const state = await stateService.createState(data, req.user?.id);
  return res
    .status(201)
    .json(new ApiResponse(201, state, "State created successfully"));
});

export const getStates = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await stateService.getStates(req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "States retrieved successfully"));
});

export const getStateBySlug = asyncHandler(async (req, res) => {
  const state = await stateService.getStateBySlug(req.params.slug);
  return res
    .status(200)
    .json(new ApiResponse(200, state, "State retrieved successfully"));
});

export const updateState = asyncHandler(async (req, res) => {
  const data = updateStateSchema.parse(req.body);
  const updatedState = await stateService.updateState(req.params.slug, data, req.user?.id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedState, "State updated successfully"));
});

export const deleteState = asyncHandler(async (req, res) => {
  await stateService.deleteState(req.params.slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "State deleted successfully"));
});
