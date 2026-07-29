import express from "express";
import {
  createState,
  getStates,
  getStateBySlug,
  updateState,
  deleteState,
} from "../controllers/state.controller.js";
import { authMiddleware, isAdmin } from "../../../core/middleware/auth.middleware.js";

const router = express.Router();

router.route("/create").post(authMiddleware, isAdmin, createState);
router.route("/get-all").get(authMiddleware, getStates);
router.route("/get/:slug").get(authMiddleware, getStateBySlug);
router.route("/update/:slug").put(authMiddleware, isAdmin, updateState);
router.route("/delete/:slug").delete(authMiddleware, isAdmin, deleteState);

export default router;
