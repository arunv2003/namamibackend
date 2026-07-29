import fieldVisitService from "../services/fieldvisit.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import {
  createFieldVisitSchema,
  updateFieldVisitSchema,
  addLocationSchema,
} from "../validations/fieldvisit.validation.js";

export const createFieldVisit = asyncHandler(async (req, res) => {
  const data = createFieldVisitSchema.parse(req.body);
  const result = await fieldVisitService.createFieldVisit(data, req.user?.id);
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Field visit created successfully"));
});

export const getFieldVisits = asyncHandler(async (req, res) => {
  const result = await fieldVisitService.getFieldVisits(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Field visits retrieved successfully"));
});

export const getfieldVisitByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const id = req.query.id || req.params.id || req.user?.id;
  const visits = await fieldVisitService.getfieldVisitByDate(date, id);
  return res
    .status(200)
    .json(new ApiResponse(200, visits, "Field visits retrieved successfully"));
});

export const getFieldVisitById = asyncHandler(async (req, res) => {
  const { id } = req.user
  const visit = await fieldVisitService.getFieldVisitById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, visit, "Field visit retrieved successfully"));
});

export const updateFieldVisit = asyncHandler(async (req, res) => {
  const data = updateFieldVisitSchema.parse(req.body);
  const updatedVisit = await fieldVisitService.updateFieldVisit(req.params.id, data);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVisit, "Field visit updated successfully"));
});

export const addLocation = asyncHandler(async (req, res) => {
  const locationData = addLocationSchema.parse(req.body);
  const updatedVisit = await fieldVisitService.addLocation(req.params.id, locationData);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVisit, "Location added successfully to field visit"));
});

export const deleteFieldVisit = asyncHandler(async (req, res) => {
  await fieldVisitService.deleteFieldVisit(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Field visit deleted successfully"));
});
