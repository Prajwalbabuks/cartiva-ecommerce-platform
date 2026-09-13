const express = require("express");

const {
    addToCart,
} = require("../controllers/cart.controller");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");

const {
    addToCartSchema,
} = require("../validators/cart.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(addToCartSchema),
    addToCart
);

module.exports = router;