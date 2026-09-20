const express = require("express");

const {
    addOrder,
    getOrders,
    getOrder,
} = require("../controllers/order.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate");

const {
    createOrderSchema,
} = require("../validators/order.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(createOrderSchema),
    addOrder
);

router.get(
    "/",
    authMiddleware,
    getOrders
);

router.get(
    "/:orderId",
    authMiddleware,
    getOrder
);
module.exports = router;