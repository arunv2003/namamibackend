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

const router = express.Router();

router.route("/options").get(authMiddleware, getCustomersForm);

// Define customer module routes
router.route("/create").post(authMiddleware, createCustomer);
router.route("/get-all").get(authMiddleware, getCustomers);

router.route("/get/:slug").get(authMiddleware, getCustomerBySlug);
router.route("/update/:slug").put(authMiddleware, updateCustomer);
router.route("/delete/:slug").delete(authMiddleware, deleteCustomer);

export default router;
