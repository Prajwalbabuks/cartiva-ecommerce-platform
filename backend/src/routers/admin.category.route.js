const express = require("express");

const {
  getAllCategoriesForAdmin,
  updateCategoryStatus,
} = require("../controllers/admin.category.controller.js");

const {authMiddleware} = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");

const router = express.Router();

// Protect all admin category routes
router.use(authMiddleware);
router.use(authorize("admin"));

// GET /api/v1/admin/categories
router.get("/", getAllCategoriesForAdmin);
router.patch("/:id/status", updateCategoryStatus);

module.exports = router;