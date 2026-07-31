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

router.route("/create").post(authMiddleware, checkPermission("tasktype", "add"), createTaskType);
router.route("/get-all").get(authMiddleware, checkPermission("tasktype", "get"), getAllTaskTypes);
router.route("/get/:slug").get(authMiddleware, checkPermission("tasktype", "get"), getTaskTypeBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("tasktype", "edit"), updateTaskType);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("tasktype", "delete"), deleteTaskType);

export default router;
