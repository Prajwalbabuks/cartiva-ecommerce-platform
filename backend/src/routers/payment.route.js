const express = require("express");

const {
    createPaymentOrder,
    verifyPayment,
} = require("../controllers/payment.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate");

const {
    createPaymentOrderSchema,
    verifyPaymentSchema,
} = require("../validators/payment.validator");

const router = express.Router();

router.post(
    "/create-order",
    authMiddleware,
    validate(createPaymentOrderSchema),
    createPaymentOrder
);

router.post(
    "/verify",
    authMiddleware,
    validate(verifyPaymentSchema),
    verifyPayment
);

module.exports = router;