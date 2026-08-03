import express from "express";
import {
  createHoliday,
  getAllHolidays,
  getHolidayBySlug,
  updateHoliday,
  deleteHoliday,
} from "../controllers/holidays.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/create").post(authMiddleware, checkPermission("admin", "holidays", "add"), createHoliday);
router.route("/get-all").get(authMiddleware, checkPermission("admin", "holidays", "get"), getAllHolidays);
router.route("/get/:slug").get(authMiddleware, checkPermission("admin", "holidays", "get"), getHolidayBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("admin", "holidays", "edit"), updateHoliday);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("admin", "holidays", "delete"), deleteHoliday);

export default router;
