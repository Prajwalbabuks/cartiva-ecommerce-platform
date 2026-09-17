const Coupon = require("../models/coupon");
const AppError = require("../utils/AppError");

const createCoupon = async (couponData) => {

    const existingCoupon = await Coupon.findOne({
        code: couponData.code,
    });

    if (existingCoupon) {
        throw new AppError(
            "Coupon code already exists",
            409
        );
    }

    const coupon = await Coupon.create(couponData);

    return coupon;
};

const getAllCoupons = async () => {
    const coupons = await Coupon.find().sort({
        createdAt: -1,
    });

    return coupons;
};

const getCouponById = async (couponId) => {
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
        throw new AppError("Coupon not found", 404);
    }

    return coupon;
};


const updateCoupon = async (couponId, updateData) => {
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
        throw new AppError("Coupon not found", 404);
    }

    if (updateData.code && updateData.code !== coupon.code) {
        const existingCoupon = await Coupon.findOne({
            code: updateData.code,
            _id: { $ne: couponId },
        });

        if (existingCoupon) {
            throw new AppError("Coupon code already exists", 409);
        }
    }

    Object.assign(coupon, updateData);

    await coupon.save();

    return coupon;
};

const deactivateCoupon = async (couponId) => {
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
        throw new AppError("Coupon not found", 404);
    }

    coupon.isActive = false;

    await coupon.save();

    return coupon;
};


const validateCoupon = async (code, subtotal) => {
    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
    });

    if (!coupon) {
        throw new AppError("Invalid or inactive coupon", 404);
    }

    const now = new Date();

    if (now < coupon.startDate) {
        throw new AppError("Coupon is not active yet", 400);
    }

    if (now > coupon.endDate) {
        throw new AppError("Coupon has expired", 400);
    }

    if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
    ) {
        throw new AppError("Coupon usage limit has been reached", 400);
    }

    if (subtotal < coupon.minOrderValue) {
        throw new AppError(
            `Minimum order value is ₹${coupon.minOrderValue}`,
            400
        );
    }

    let discount =
        subtotal * (coupon.discountPercentage / 100);

    if (
        coupon.maxDiscount !== null &&
        discount > coupon.maxDiscount
    ) {
        discount = coupon.maxDiscount;
    }

    const finalTotal = subtotal - discount;

    return {
        couponId: coupon._id,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discount,
        subtotal,
        finalTotal,
    };
};

module.exports = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deactivateCoupon,
    validateCoupon,
};