import express from "express";
import {
  createRegion,
  getRegions,
  getRegionBySlug,
  updateRegion,
  deleteRegion,
  getRegionByStateId,
} from "../controllers/region.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/create").post(authMiddleware, checkPermission("admin", "region", "add"), createRegion);
router.route("/get-all").get(authMiddleware, checkPermission("admin", "region", "get"), getRegions);
router.route("/get/:slug").get(authMiddleware, checkPermission("admin", "region", "get"), getRegionBySlug);
router.route("/get-by-state-id/:stateId").get(authMiddleware, checkPermission("admin", "region", "get"), getRegionByStateId);
router.route("/update/:slug").put(authMiddleware, checkPermission("admin", "region", "edit"), updateRegion);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("admin", "region", "delete"), deleteRegion);

export default router;
