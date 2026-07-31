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

router.route("/create").post(authMiddleware, checkPermission("location", "state", "add"), createState);
router.route("/get-all").get(authMiddleware, checkPermission("location", "state", "get"), getStates);
router.route("/get/:slug").get(authMiddleware, checkPermission("location", "state", "get"), getStateBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("location", "state", "edit"), updateState);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("location", "state", "delete"), deleteState);

export default router;
