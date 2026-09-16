const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            trim: true,
            uppercase: true,
        },

        discountPercentage: {
            type: Number,
            required: [true, "Discount percentage is required"],
            min: [1, "Discount percentage must be at least 1"],
            max: [100, "Discount percentage cannot exceed 100"],
        },

        minOrderValue: {
            type: Number,
            default: 0,
            min: [0, "Minimum order value cannot be negative"],
        },

        maxDiscount: {
            type: Number,
            default: null,
            min: [0, "Maximum discount cannot be negative"],
        },

        startDate: {
            type: Date,
            required: [true, "Coupon start date is required"],
        },

        endDate: {
            type: Date,
            required: [true, "Coupon end date is required"],
        },

        usageLimit: {
            type: Number,
            default: null,
            min: [1, "Usage limit must be at least 1"],
        },

        usedCount: {
            type: Number,
            default: 0,
            min: [0, "Used count cannot be negative"],
        },

        perUserLimit: {
            type: Number,
            default: 1,
            min: [1, "Per user limit must be at least 1"],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;