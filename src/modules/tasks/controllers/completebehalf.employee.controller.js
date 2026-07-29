import completeBehalfEmployeeService from "../services/completebehalf.employee.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";

export const getCompleteBehalfFields = asyncHandler(async (req, res) => {
  const data = await completeBehalfEmployeeService.fetchCompletionField();
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Complete behalf fields retrieved successfully"));
});

export const completetaskandcreateagain = asyncHandler(async (req, res) => {
  const { taskId, ...formData } = req.body;
  const userId = req.user?.id;

  if (!taskId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "taskId is required"));
  }

  const result = await completeBehalfEmployeeService.completeTask(
    taskId,
    formData,
    userId
  );

  const message =
    result.collectPayment === "no"
      ? "Task completed and new task created successfully"
      : "Task completed successfully";

  return res.status(200).json(new ApiResponse(200, result, message));
});