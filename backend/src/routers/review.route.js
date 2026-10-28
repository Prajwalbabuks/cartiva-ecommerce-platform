
const express = require("express");
const reviewController = require("../controllers/review.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
    "/product/:productId",
    reviewController.getProductReviews
);

router.post(
    "/",
    authMiddleware,
    reviewController.createReview
);

router.patch(
    "/:reviewId",
    authMiddleware,
    reviewController.updateReview
);

router.delete(
    "/:reviewId",
    authMiddleware,
    reviewController.deleteReview
);

module.exports = router;
