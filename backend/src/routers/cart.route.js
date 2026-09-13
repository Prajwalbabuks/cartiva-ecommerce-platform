const express = require("express");

const {
    addToCart,
    getCart,
    updateCart,
    removeFromCart,
} = require("../controllers/cart.controller");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");

const {
    addToCartSchema,
    updateCartItemSchema,
} = require("../validators/cart.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(addToCartSchema),
    addToCart
);

router.get(
    "/",
    authMiddleware,
    getCart
);

router.patch(
    "/:productId",
    authMiddleware,
    validate(updateCartItemSchema),
    updateCart
);


router.delete(
    "/:productId",
    authMiddleware,
    removeFromCart
);

module.exports = router;