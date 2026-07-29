import officeService from "../services/office.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import {
  createOfficeSchema,
  updateOfficeSchema
} from "../validations/office.validation.js";

export const createOffice = asyncHandler(async (req, res) => {
  const data = createOfficeSchema.parse(req.body);

  const office = await officeService.createOffice(data, req.user?.id);
  return res
    .status(201)
    .json(new ApiResponse(201, office, "Office created successfully"));
});

export const getOffices = asyncHandler(async (req, res) => {
  const result = await officeService.getOffices(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Offices retrieved successfully"));
});

export const getOfficeBySlug = asyncHandler(async (req, res) => {
  const office = await officeService.getOfficeBySlug(req.params.slug);
  return res
    .status(200)
    .json(new ApiResponse(200, office, "Office retrieved successfully"));
});

export const updateOffice = asyncHandler(async (req, res) => {
  const data = updateOfficeSchema.parse(req.body);

  const updatedOffice = await officeService.updateOffice(req.params.slug, data, req.user?.id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedOffice, "Office updated successfully"));
});

export const deleteOffice = asyncHandler(async (req, res) => {
  await officeService.deleteOffice(req.params.slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Office deleted successfully"));
});
