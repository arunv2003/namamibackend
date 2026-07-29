import express from "express";
import {
  createEmployee,
  getEmployeeFields,
  getEmployees,
  getEmployeeContactWithCustomer,
  getEmployeeBySlug,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  logoutEmployee,
  getPermissionByRole,
} from "../controllers/employee.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { authLimiter } from "../../../core/middleware/security.js";

const router = express.Router();

// Define employee module routes
router.route("/create").post(authMiddleware, createEmployee);
router.route("/create-form").get(authMiddleware, getEmployeeFields);
router.route("/get-all").get(authMiddleware, getEmployees);
router.route("/contact-with-customer").get(authMiddleware, getEmployeeContactWithCustomer);
router.route("/logout").post(authMiddleware, logoutEmployee);
router.route("/login").post(authLimiter, loginEmployee);
router.route("/get-permission").get(authMiddleware, getPermissionByRole);
router.route("/get/:slug").get(authMiddleware, getEmployeeBySlug);
router.route("/update/:slug").put(authMiddleware, updateEmployee);
router.route("/delete/:slug").delete(authMiddleware, deleteEmployee);

export default router;
