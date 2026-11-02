const express = require("express");

const {
  getAllProductsForAdmin,
  updateProductStatus,
} = require("../controllers/admin.product.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("admin"));

router.get("/", getAllProductsForAdmin);
router.patch("/:id/status", updateProductStatus);

module.exports = router;