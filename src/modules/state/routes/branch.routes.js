import express from "express";
import {
  createBranch,
  getBranches,
  getBranchBySlug,
  updateBranch,
  deleteBranch,
  getBranchByRegionId,
} from "../controllers/branch.controller.js";
import { authMiddleware, isAdmin } from "../../../core/middleware/auth.middleware.js";

const router = express.Router();

router.route("/create").post(authMiddleware, isAdmin, createBranch);
router.route("/get-all").get(authMiddleware, getBranches);
router.route("/get/:slug").get(authMiddleware, getBranchBySlug);
router.route("/get-by-region-id/:regionId").get(authMiddleware, getBranchByRegionId);
router.route("/update/:slug").put(authMiddleware, isAdmin, updateBranch);
router.route("/delete/:slug").delete(authMiddleware, isAdmin, deleteBranch);

export default router;
