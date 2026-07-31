import express from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  getTaskBySlug,
  getAllTasks,
  getCustomerTasks,
  getEmployeeTasks,
  getCreateTaskForm,
  getTeamTask,
} from "../controllers/task.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route('/create-form').get(authMiddleware, getCreateTaskForm);

router.route("/create").post(authMiddleware, checkPermission("task", "taskAll", "add"), createTask);
router.route("/get-all").get(authMiddleware, checkPermission("task", "taskAll", "get"), getAllTasks);
router.route("/get/:slug").get(authMiddleware, checkPermission("task", "taskAll", "get"), getTaskBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("task", "taskAll", "edit"), updateTask);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("task", "taskAll", "delete"), deleteTask);
router.route("/customer/task").get(authMiddleware, checkPermission("task", "taskCustomer", "get"), getCustomerTasks);
router.route("/employee/task").get(authMiddleware, checkPermission("task", "taskAll", "get"), getEmployeeTasks);
router.route("/team/task").get(authMiddleware, checkPermission("task", "teamTask", "get"), getTeamTask);
router.route("/employee/task/:employeeId").get(authMiddleware, checkPermission("task", "taskAll", "get"), getEmployeeTasks);

export default router;
