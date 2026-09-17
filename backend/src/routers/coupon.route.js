const express = require("express");

const {
    addCoupon,
    getCoupons,
    getCoupon,
    editCoupon,
    disableCoupon,
    checkCoupon,
} = require("../controllers/coupon.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate");

const {
    createCouponSchema,
    updateCouponSchema,
    validateCouponSchema
} = require("../validators/coupon.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorize("admin"),
    validate(createCouponSchema),
    addCoupon
);

router.get(
    "/",
    authMiddleware,
    authorize("admin"),
    getCoupons
);

router.post(
    "/validate",
    authMiddleware,
    validate(validateCouponSchema),
    checkCoupon
);

router.get(
    "/:couponId",
    authMiddleware,
    authorize("admin"),
    getCoupon
);

router.patch(
    "/:couponId",
    authMiddleware,
    authorize("admin"),
    validate(updateCouponSchema),
    editCoupon
);

router.patch(
    "/:couponId/deactivate",
    authMiddleware,
    authorize("admin"),
    disableCoupon
);


module.exports = router;