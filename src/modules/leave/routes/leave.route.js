import express from "express";
import {
  applyLeave,
  getAllLeaves,
  getLeaveById,
  updateLeave,
  actionOnLeave,
  deleteLeave,
} from "../controllers/leave.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/apply").post(authMiddleware, checkPermission("leave", "leave", "add"), applyLeave);
router.route("/get-all").get(authMiddleware, checkPermission("leave", "leave", "get"), getAllLeaves);
router.route("/get/:id").get(authMiddleware, checkPermission("leave", "leave", "get"), getLeaveById);
router.route("/update/:id").put(authMiddleware, checkPermission("leave", "leave", "edit"), updateLeave);
router.route("/action/:id").patch(authMiddleware, checkPermission("leave", "leave", "edit"), actionOnLeave);
router.route("/delete/:id").delete(authMiddleware, checkPermission("leave", "leave", "delete"), deleteLeave);

export default router;
