import express from "express";
import {
  createNonWorkingDay,
  getAllNonWorkingDays,
  getNonWorkingDayById,
  updateNonWorkingDay,
  deleteNonWorkingDay,
} from "../controllers/nonworking.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/create").post(authMiddleware, checkPermission("admin", "nonworking", "add"), createNonWorkingDay);
router.route("/get-all").get(authMiddleware, checkPermission("admin", "nonworking", "get"), getAllNonWorkingDays);
router.route("/get/:id").get(authMiddleware, checkPermission("admin", "nonworking", "get"), getNonWorkingDayById);
router.route("/update/:id").put(authMiddleware, checkPermission("admin", "nonworking", "edit"), updateNonWorkingDay);
router.route("/delete/:id").delete(authMiddleware, checkPermission("admin", "nonworking", "delete"), deleteNonWorkingDay);

export default router;
