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
  getMyTeamEmployees,
  getProfileData,
} from "../controllers/employee.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { authLimiter } from "../../../core/middleware/security.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

// Define employee module routes
router.route("/create").post(authMiddleware, checkPermission("employee", "allEmployee", "add"), createEmployee);
router.route("/create-form").get(authMiddleware, getEmployeeFields);
router.route("/get-all").get(authMiddleware, checkPermission("employee", "allEmployee", "get"), getEmployees);
router.route("/contact-with-customer").get(authMiddleware, checkPermission("employee", "allEmployee", "get"), getEmployeeContactWithCustomer);
router.route("/my-team").get(authMiddleware, checkPermission("employee", "myTeam", "get"), getMyTeamEmployees);
router.route("/logout").post(authMiddleware, logoutEmployee);
router.route("/login").post(authLimiter, loginEmployee);
router.route("/get-permission").get(authMiddleware, getPermissionByRole);
router.route('/profile').get(authMiddleware, getProfileData);
router.route("/get/:slug").get(authMiddleware, checkPermission("employee", "allEmployee", "get"), getEmployeeBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("employee", "allEmployee", "edit"), updateEmployee);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("employee", "allEmployee", "delete"), deleteEmployee);

export default router;
