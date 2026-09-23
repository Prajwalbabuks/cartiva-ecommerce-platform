const express = require("express");

const {
    createPaymentOrder,
} = require("../controllers/payment.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const { createPaymentOrderSchema } = require("../validators/payment.validator");
const validateRequest = require("../middlewares/validate");

const router = express.Router();

router.post(
    "/create-order",
    authMiddleware,
    validateRequest(createPaymentOrderSchema),
    createPaymentOrder
);

module.exports = router;