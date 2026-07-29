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
} from "../controllers/task.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";

const router = express.Router();

router.route('/create-form').get(authMiddleware, getCreateTaskForm);



router.route("/create").post(authMiddleware, createTask);
router.route("/get-all").get(authMiddleware, getAllTasks);
router.route("/get/:slug").get(authMiddleware, getTaskBySlug);
router.route("/update/:slug").put(authMiddleware, updateTask);
router.route("/delete/:slug").delete(authMiddleware, deleteTask);
router.route("/customer/task").get(authMiddleware, getCustomerTasks);
router.route("/employee/task").get(authMiddleware, getEmployeeTasks);
router.route("/employee/task/:employeeId").get(authMiddleware, getEmployeeTasks);

export default router;
