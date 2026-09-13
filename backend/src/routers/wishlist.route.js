const express = require("express");

const {
    addToWishlist,
} = require("../controllers/wishlist.controller");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");

const {
    addToWishlistSchema,
} = require("../validators/wishlist.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(addToWishlistSchema),
    addToWishlist
);

module.exports = router;