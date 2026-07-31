import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerBySlug,
  updateCustomer,
  deleteCustomer,
  getCustomersForm,
} from "../controllers/customer.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/options").get(authMiddleware, getCustomersForm);

// Define customer module routes
router.route("/create").post(authMiddleware, checkPermission("customer", "add"), createCustomer);
router.route("/get-all").get(authMiddleware, checkPermission("customer", "get"), getCustomers);

router.route("/get/:slug").get(authMiddleware, checkPermission("customer", "get"), getCustomerBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("customer", "edit"), updateCustomer);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("customer", "delete"), deleteCustomer);

export default router;
