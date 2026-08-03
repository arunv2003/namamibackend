import express from "express";
import {
  createAttendance,
  clockIn,
  clockOut,
  getTodayAttendance,
  getAttendanceSummary,
  getAttendances,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  markDailyAbsentees,
  getAllEmployeeAttendance,
} from "../controllers/attendance.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/create").post(authMiddleware, checkPermission("attendance", "attendanceDetails", "add"), createAttendance);
router.route("/clock-in").post(authMiddleware, checkPermission("attendance", "attendanceDetails", "add"), clockIn);
router.route("/clock-out").post(authMiddleware, checkPermission("attendance", "attendanceDetails", "add"), clockOut);
router.route("/all-employee-attendance").get(authMiddleware, checkPermission("attendance", "attendanceDetails", "get"), getAllEmployeeAttendance);
router.route("/today").get(authMiddleware, checkPermission("attendance", "attendanceDetails", "get"), getTodayAttendance);
router.route("/today/:employeeId").get(authMiddleware, checkPermission("attendance", "attendanceDetails", "get"), getTodayAttendance);
router.route("/summary").get(authMiddleware, checkPermission("attendance", "monthlyAttendance", "get"), getAttendanceSummary);
router.route("/get-all").get(authMiddleware, checkPermission("attendance", "attendanceDetails", "get"), getAttendances);
router.route("/get/:id").get(authMiddleware, checkPermission("attendance", "attendanceDetails", "get"), getAttendanceById);
router.route("/update/:id").put(authMiddleware, checkPermission("attendance", "attendanceDetails", "edit"), updateAttendance);
router.route("/delete/:id").delete(authMiddleware, checkPermission("attendance", "attendanceDetails", "delete"), deleteAttendance);
router.route("/mark-absentees").post(authMiddleware, checkPermission("attendance", "attendanceDetails", "edit"), markDailyAbsentees);

export default router;
