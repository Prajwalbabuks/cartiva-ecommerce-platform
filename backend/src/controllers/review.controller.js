
const reviewService = require("../services/review.service");

const createReview = async (req, res, next) => {
    try {
        const review = await reviewService.createReview({
            productId: req.body.productId,
            userId: req.user.userId,
            rating: req.body.rating,
            comment: req.body.comment,
        });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

const getProductReviews = async (req, res, next) => {
    try {
        const result = await reviewService.getProductReviews(
            req.params.productId,
            req.query.page,
            req.query.limit
        );

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    try {
        const review = await reviewService.updateReview({
            reviewId: req.params.reviewId,
            userId: req.user.userId,
            rating: req.body.rating,
            comment: req.body.comment,
        });

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        await reviewService.deleteReview({
            reviewId: req.params.reviewId,
            userId: req.user.userId,
        });

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
};
