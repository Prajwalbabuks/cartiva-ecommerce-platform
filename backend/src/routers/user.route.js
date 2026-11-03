
const express = require("express");

const {
    getAllCustomers,
    getCustomerById,
    updateCustomerStatus,
} = require("../controllers/user.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = express.Router();

// All routes require admin authentication
router.use(authMiddleware, authorize("admin"));

// Get all customers
router.get("/", getAllCustomers);

// Get individual customer details
router.get("/:customerId", getCustomerById);

// Activate or deactivate customer
router.patch("/:customerId/status", updateCustomerStatus);

module.exports = router;
