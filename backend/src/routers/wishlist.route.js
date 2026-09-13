const express = require("express");

const {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    addToCartFromWishlist,
} = require("../controllers/wishlist.controller");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");

const {
    addToWishlistSchema,
    addWishlistItemToCartSchema
} = require("../validators/wishlist.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(addToWishlistSchema),
    addToWishlist
);

router.get(
    "/",
    authMiddleware,
    getWishlist
);

router.delete(
    "/:productId",
    authMiddleware,
    removeFromWishlist
);

router.post(
    "/:productId/cart",
    authMiddleware,
    validate(addWishlistItemToCartSchema),
    addToCartFromWishlist
);

module.exports = router;