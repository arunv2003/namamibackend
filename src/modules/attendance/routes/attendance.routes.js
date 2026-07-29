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

const router = express.Router();

router.route("/create").post(authMiddleware, createAttendance);
router.route("/clock-in").post(authMiddleware, clockIn);
router.route("/clock-out").post(authMiddleware, clockOut);
router.route("/all-employee-attendance").get(authMiddleware, getAllEmployeeAttendance);
router.route("/today").get(authMiddleware, getTodayAttendance);
router.route("/today/:employeeId").get(authMiddleware, getTodayAttendance);
router.route("/summary").get(authMiddleware, getAttendanceSummary);
router.route("/get-all").get(authMiddleware, getAttendances);
router.route("/get/:id").get(authMiddleware, getAttendanceById);
router.route("/update/:id").put(authMiddleware, updateAttendance);
router.route("/delete/:id").delete(authMiddleware, deleteAttendance);
router.route("/mark-absentees").post(authMiddleware, markDailyAbsentees);

export default router;
