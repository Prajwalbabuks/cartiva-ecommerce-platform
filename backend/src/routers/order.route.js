const express = require("express");

const {
    addOrder,
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

module.exports = router;