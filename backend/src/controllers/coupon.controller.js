const asyncHandler = require("../utils/asyncHandler");
const { createCoupon } = require("../services/coupon.service");

const addCoupon = asyncHandler(async (req, res) => {

    const coupon = await createCoupon(req.body);

    res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        coupon,
    });
});

module.exports = {
    addCoupon,
};