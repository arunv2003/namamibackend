import express from "express";
import {
  createTaskType,
  getAllTaskTypes,
  getTaskTypeBySlug,
  updateTaskType,
  deleteTaskType,
} from "../controllers/task.type.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/create").post(authMiddleware, checkPermission("admin", "tasktype", "add"), createTaskType);
router.route("/get-all").get(authMiddleware, checkPermission("admin", "tasktype", "get"), getAllTaskTypes);
router.route("/get/:slug").get(authMiddleware, checkPermission("admin", "tasktype", "get"), getTaskTypeBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("admin", "tasktype", "edit"), updateTaskType);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("admin", "tasktype", "delete"), deleteTaskType);

export default router;
