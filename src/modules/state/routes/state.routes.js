import express from "express";
import {
  createState,
  getStates,
  getStateBySlug,
  updateState,
  deleteState,
} from "../controllers/state.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/create").post(authMiddleware, checkPermission("admin", "state", "add"), createState);
router.route("/get-all").get(authMiddleware, checkPermission("admin", "state", "get"), getStates);
router.route("/get/:slug").get(authMiddleware, checkPermission("admin", "state", "get"), getStateBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("admin", "state", "edit"), updateState);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("admin", "state", "delete"), deleteState);

export default router;
