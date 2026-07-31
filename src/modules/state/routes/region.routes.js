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

router.route("/create").post(authMiddleware, checkPermission("location", "region", "add"), createRegion);
router.route("/get-all").get(authMiddleware, checkPermission("location", "region", "get"), getRegions);
router.route("/get/:slug").get(authMiddleware, checkPermission("location", "region", "get"), getRegionBySlug);
router.route("/get-by-state-id/:stateId").get(authMiddleware, checkPermission("location", "region", "get"), getRegionByStateId);
router.route("/update/:slug").put(authMiddleware, checkPermission("location", "region", "edit"), updateRegion);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("location", "region", "delete"), deleteRegion);

export default router;
