import express from "express";
import {
  createTaskType,
  getAllTaskTypes,
  getTaskTypeBySlug,
  updateTaskType,
  deleteTaskType,
} from "../controllers/task.type.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";

const router = express.Router();

router.route("/create").post(authMiddleware, createTaskType);
router.route("/get-all").get(authMiddleware, getAllTaskTypes);
router.route("/get/:slug").get(authMiddleware, getTaskTypeBySlug);
router.route("/update/:slug").put(authMiddleware, updateTaskType);
router.route("/delete/:slug").delete(authMiddleware, deleteTaskType);

export default router;
