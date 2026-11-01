
const express = require("express");

const { authMiddleware } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const {
    getDashboard,
} = require("../controllers/admin.controller");

const router = express.Router();

// All routes in this router require admin access
router.use(authMiddleware);
router.use(authorize("admin"));

// Dashboard overview
router.get("/dashboard/overview", getDashboard);

module.exports = router;
