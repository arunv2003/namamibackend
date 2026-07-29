import express from "express";
import {
  createRegion,
  getRegions,
  getRegionBySlug,
  updateRegion,
  deleteRegion,
  getRegionByStateId,
} from "../controllers/region.controller.js";
import { authMiddleware, isAdmin } from "../../../core/middleware/auth.middleware.js";

const router = express.Router();

router.route("/create").post(authMiddleware, isAdmin, createRegion);
router.route("/get-all").get(authMiddleware, getRegions);
router.route("/get/:slug").get(authMiddleware, getRegionBySlug);
router.route("/get-by-state-id/:stateId").get(authMiddleware, getRegionByStateId);
router.route("/update/:slug").put(authMiddleware, isAdmin, updateRegion);
router.route("/delete/:slug").delete(authMiddleware, isAdmin, deleteRegion);

export default router;
