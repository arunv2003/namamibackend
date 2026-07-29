import attendanceService from "../services/attendance.service.js";
import { asyncHandler } from "../../../core/utils/asyncHandler.js";
import { ApiResponse } from "../../../core/utils/apiResponse.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import {
  createAttendanceSchema,
  clockInSchema,
  clockOutSchema,
  updateAttendanceSchema,
} from "../validations/attendance.validation.js";
import { employeeSchema } from "../../employees/models/employee.model.js";

export const createAttendance = asyncHandler(async (req, res) => {
  const data = createAttendanceSchema.parse(req.body);
  const result = await attendanceService.createAttendance(data, req.user?.id);
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Attendance recorded successfully"));
});

export const clockIn = asyncHandler(async (req, res) => {
  const { id } = req.user;
  
  const currentEmployee = await employeeSchema.findByPk(id);

  if (!currentEmployee || currentEmployee.status !== "active") {
    throw new ApiError(400, "Invalid or inactive employee");
  }
  const data = clockInSchema.parse(req.body);
  data.employee_id = id;
  const result = await attendanceService.clockIn(data, id);
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Clocked in successfully"));
});

export const clockOut = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const currentEmployee = await employeeSchema.findByPk(id);
  if (!currentEmployee || currentEmployee.status !== "active") {
    throw new ApiError(400, "Invalid or inactive employee");
  }
  const data = clockOutSchema.parse(req.body);
  data.employee_id = id;
  const result = await attendanceService.clockOut(data, id);
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Clocked out successfully"));
});

export const getAllEmployeeAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "" } = req.query;
  
  const result = await attendanceService.getAllEmployeeAttendance(req.user?.id, page, limit, search, status);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Employee all attendance retrieved successfully"));
});








export const getTodayAttendance = asyncHandler(async (req, res) => {
  const empId = req.params.employeeId || req.user?.id || req.query.employee_id;
  const result = await attendanceService.getTodayAttendance(empId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Today's attendance status retrieved successfully"));
});

export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAttendanceSummary(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Attendance summary retrieved successfully"));
});


export const getAttendances = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAttendances(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Attendance records retrieved successfully"));
});

export const getAttendanceById = asyncHandler(async (req, res) => {
  const record = await attendanceService.getAttendanceById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, record, "Attendance record retrieved successfully"));
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const data = updateAttendanceSchema.parse(req.body);
  const updatedRecord = await attendanceService.updateAttendance(req.params.id, data);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, "Attendance record updated successfully"));
});

export const deleteAttendance = asyncHandler(async (req, res) => {
  await attendanceService.deleteAttendance(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Attendance record deleted successfully"));
});

export const markDailyAbsentees = asyncHandler(async (req, res) => {
  const targetDate = req.body?.date || req.query?.date;
  const result = await attendanceService.markDailyAbsentees(targetDate);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Daily absentees marked successfully"));
});

