
const mongoose = require("mongoose");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const AppError = require("../utils/AppError");

const roundMoney = (amount) =>
    Math.round((amount + Number.EPSILON) * 100) / 100;

const normalizeCode = (code) =>
    typeof code === "string" ? code.trim().toUpperCase() : "";

const createCoupon = async (couponData) => {
    const code = normalizeCode(couponData.code);

    const existingCoupon = await Coupon.findOne({ code });

    if (existingCoupon) {
        throw new AppError("Coupon code already exists", 409);
    }

    try {
        return await Coupon.create({
            ...couponData,
            code,
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new AppError("Coupon code already exists", 409);
        }
        throw error;
    }
};

const getAllCoupons = async () => {
    return Coupon.find().sort({ createdAt: -1 });
};

const getCouponById = async (couponId) => {
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
        throw new AppError("Invalid coupon ID", 400);
    }

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
        throw new AppError("Coupon not found", 404);
    }

    return coupon;
};

const updateCoupon = async (couponId, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
        throw new AppError("Invalid coupon ID", 400);
    }

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
        throw new AppError("Coupon not found", 404);
    }

    if (updateData.code !== undefined) {
        const code = normalizeCode(updateData.code);

        const existingCoupon = await Coupon.findOne({
            code,
            _id: { $ne: coupon._id },
        });

        if (existingCoupon) {
            throw new AppError("Coupon code already exists", 409);
        }

        updateData = { ...updateData, code };
    }

    const nextStartDate = updateData.startDate ?? coupon.startDate;
    const nextEndDate = updateData.endDate ?? coupon.endDate;

    if (new Date(nextEndDate) <= new Date(nextStartDate)) {
        throw new AppError(
            "End date must be after start date",
            400
        );
    }

    Object.assign(coupon, updateData);

    try {
        await coupon.save();
    } catch (error) {
        if (error.code === 11000) {
            throw new AppError("Coupon code already exists", 409);
        }
        throw error;
    }

    return coupon;
};

const deactivateCoupon = async (couponId) => {
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
        throw new AppError("Invalid coupon ID", 400);
    }

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
        throw new AppError("Coupon not found", 404);
    }

    coupon.isActive = false;
    await coupon.save();

    return coupon;
};

const validateCoupon = async (code, subtotal, userId) => {
    const normalizedCode = normalizeCode(code);

    if (!normalizedCode) {
        throw new AppError("Coupon code is required", 400);
    }

    if (
        typeof subtotal !== "number" ||
        !Number.isFinite(subtotal) ||
        subtotal < 0
    ) {
        throw new AppError("Invalid order subtotal", 400);
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError("A valid user is required", 400);
    }

    const coupon = await Coupon.findOne({
        code: normalizedCode,
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
        throw new AppError(
            "Coupon usage limit has been reached",
            400
        );
    }

    if (subtotal < coupon.minOrderValue) {
        throw new AppError(
            `Minimum order value is ₹${coupon.minOrderValue}`,
            400
        );
    }

    const previousUses = await Order.countDocuments({
        user: userId,
        "coupon.couponId": coupon._id,
        paymentStatus: "paid",
    });

    if (previousUses >= coupon.perUserLimit) {
        throw new AppError(
            "You have reached the usage limit for this coupon",
            400
        );
    }

    let discount = roundMoney(
        subtotal * (coupon.discountPercentage / 100)
    );

    if (
        coupon.maxDiscount !== null &&
        discount > coupon.maxDiscount
    ) {
        discount = roundMoney(coupon.maxDiscount);
    }

    // A discount must never exceed the order subtotal.
    discount = Math.min(discount, roundMoney(subtotal));

    return {
        couponId: coupon._id,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discount,
        subtotal: roundMoney(subtotal),
        finalTotal: roundMoney(subtotal - discount),
    };
};


const redeemCouponForOrder = async (order, session) => {
    if (!order.coupon?.couponId) {
        return;
    }

    const couponId = order.coupon.couponId;
    const userId = order.user;

    // Count this user's already-paid orders using the coupon.
    const previousUses = await Order.countDocuments({
        user: userId,
        "coupon.couponId": couponId,
        paymentStatus: "paid",
    }).session(session);

    const coupon = await Coupon.findById(couponId).session(session);

    if (!coupon) {
        throw new AppError(
            "The coupon associated with this order no longer exists",
            409
        );
    }

    if (previousUses >= coupon.perUserLimit) {
        throw new AppError(
            "Your coupon usage limit has been reached",
            409
        );
    }

    // Atomically enforce the global limit.
    const filter = {
        _id: couponId,
    };

    if (coupon.usageLimit !== null) {
        filter.usedCount = { $lt: coupon.usageLimit };
    }

    const result = await Coupon.updateOne(
        filter,
        { $inc: { usedCount: 1 } },
        { session }
    );

    if (result.modifiedCount !== 1) {
        throw new AppError(
            "Coupon usage limit has been reached",
            409
        );
    }
};


module.exports = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deactivateCoupon,
    validateCoupon,
    redeemCouponForOrder,
};
