import express from "express";
import {
  createFieldVisit,
  getFieldVisits,
  getFieldVisitById,
  updateFieldVisit,
  addLocation,
  deleteFieldVisit,
  getfieldVisitByDate,
} from "../controllers/fieldvisit.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";

const router = express.Router();

router.route("/create").post(authMiddleware, createFieldVisit);
router.route('/get-by-date').get(authMiddleware,getfieldVisitByDate)
router.route("/get-all").get(authMiddleware, getFieldVisits);
router.route("/get/:id").get(authMiddleware, getFieldVisitById);
router.route("/update/:id").put(authMiddleware, updateFieldVisit);
router.route("/delete/:id").delete(authMiddleware, deleteFieldVisit);

export default router;
