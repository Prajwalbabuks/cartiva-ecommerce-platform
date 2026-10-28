
const mongoose = require("mongoose");
const Review = require("../models/review");
const Product = require("../models/product");
const Order = require("../models/order");

const createReview = async ({ productId, userId, rating, comment }) => {
    if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(userId)
    ) {
        const error = new Error("Invalid product or user ID");
        error.statusCode = 400;
        throw error;
    }

    const product = await Product.findOne({
        _id: productId,
        isActive: true,
    });

    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    const hasPurchased = await Order.exists({
        user: userId,
        paymentStatus: "paid",
        "items.product": productId,
    });

    if (!hasPurchased) {
        const error = new Error(
            "You must purchase this product before reviewing it"
        );
        error.statusCode = 403;
        throw error;
    }

    const existingReview = await Review.exists({
        product: productId,
        user: userId,
    });

    if (existingReview) {
        const error = new Error("You have already reviewed this product");
        error.statusCode = 409;
        throw error;
    }

    try {
        const review = await Review.create({
            product: productId,
            user: userId,
            rating,
            comment,
        });

        return review;
    } catch (error) {
        // The unique index also protects against concurrent duplicate requests.
        if (error.code === 11000) {
            const duplicateError = new Error(
                "You have already reviewed this product"
            );
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw error;
    }
};

const getProductReviews = async (productId, page = 1, limit = 10) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        const error = new Error("Invalid product ID");
        error.statusCode = 400;
        throw error;
    }

    const product = await Product.findOne({
        _id: productId,
        isActive: true,
    }).select("_id");

    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

    const [reviews, totalReviews, ratingSummary] = await Promise.all([
        Review.find({ product: productId })
            .populate("user", "name avatar")
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .lean(),

        Review.countDocuments({ product: productId }),

        Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId) } },
            {
                $group: {
                    _id: "$product",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]),
    ]);

    const summary = ratingSummary[0] || {
        averageRating: 0,
        totalReviews: 0,
    };

    return {
        reviews,
        pagination: {
            page: currentPage,
            limit: pageSize,
            totalReviews,
            totalPages: Math.ceil(totalReviews / pageSize),
        },
        rating: {
            average: summary.averageRating,
            count: summary.totalReviews,
        },
    };
};

const updateReview = async ({ reviewId, userId, rating, comment }) => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        const error = new Error("Invalid review ID");
        error.statusCode = 400;
        throw error;
    }

    const review = await Review.findOne({
        _id: reviewId,
        user: userId,
    });

    if (!review) {
        const error = new Error("Review not found");
        error.statusCode = 404;
        throw error;
    }

    if (rating !== undefined) {
        review.rating = rating;
    }

    if (comment !== undefined) {
        review.comment = comment;
    }

    await review.save();

    return review;
};

const deleteReview = async ({ reviewId, userId }) => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        const error = new Error("Invalid review ID");
        error.statusCode = 400;
        throw error;
    }

    const review = await Review.findOneAndDelete({
        _id: reviewId,
        user: userId,
    });

    if (!review) {
        const error = new Error("Review not found");
        error.statusCode = 404;
        throw error;
    }

    return review;
};

module.exports = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
};
