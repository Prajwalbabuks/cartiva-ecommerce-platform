const express = require("express");

const {
    addCoupon,
} = require("../controllers/coupon.controller");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const {
  createCouponSchema,
} = require("../validators/coupon.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorize("admin"),
    validate(createCouponSchema),
    addCoupon
);

module.exports = router;