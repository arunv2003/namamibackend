import express from "express";
import {
  createBranch,
  getBranches,
  getBranchBySlug,
  updateBranch,
  deleteBranch,
  getBranchByRegionId,
} from "../controllers/branch.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/create").post(authMiddleware, checkPermission("admin", "branch", "add"), createBranch);
router.route("/get-all").get(authMiddleware, checkPermission("admin", "branch", "get"), getBranches);
router.route("/get/:slug").get(authMiddleware, checkPermission("admin", "branch", "get"), getBranchBySlug);
router.route("/get-by-region-id/:regionId").get(authMiddleware, checkPermission("admin", "branch", "get"), getBranchByRegionId);
router.route("/update/:slug").put(authMiddleware, checkPermission("admin", "branch", "edit"), updateBranch);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("admin", "branch", "delete"), deleteBranch);

export default router;
