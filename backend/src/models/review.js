
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product is required"],
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },

        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
            validate: {
                validator: Number.isInteger,
                message: "Rating must be a whole number between 1 and 5",
            },
        },

        comment: {
            type: String,
            trim: true,
            maxlength: [1000, "Review cannot exceed 1000 characters"],
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// One review per user for each product.
reviewSchema.index(
    { product: 1, user: 1 },
    { unique: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
