import customerService from "../services/customer.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validations/customer.validation.js";
import { RoleSchema } from "../../roles/models/role.model.js";

export const getCustomersForm = asyncHandler(async (req, res) => {
  let roleSlug = req.roleSlug;
  if (!roleSlug && (req.user?.type || req.roleId)) {
    const role = await RoleSchema.findByPk(req.user.type || req.roleId);
    roleSlug = role?.slug;
  }

  const result = await customerService.getCustomersForm(roleSlug);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Customers retrieved successfully"));
});

export const createCustomer = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const data = createCustomerSchema.parse(req.body);
  const customer = await customerService.createCustomer(data, userId);
  return res
    .status(201)
    .json(new ApiResponse(201, customer, "Customer created successfully"));
});

export const getCustomers = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const roleId = req.user?.type || req.roleId;
  const result = await customerService.getCustomers(req.query, userId, roleId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Customers retrieved successfully"));
});

export const getCustomerBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const customer = await customerService.getCustomerBySlug(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, customer, "Customer retrieved successfully"));
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const data = updateCustomerSchema.parse(req.body);
  const userId = req.user?.id;
  const updatedCustomer = await customerService.updateCustomer(slug, data, userId);
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedCustomer, "Customer updated successfully"),
    );
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  await customerService.deleteCustomer(slug);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Customer deleted successfully"));
});
