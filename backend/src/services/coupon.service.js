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

module.exports = {
    createCoupon,
};