const asyncHandler = require("../utils/asyncHandler");
const { 
      createCoupon,
      getAllCoupons,
      getCouponById,
      updateCoupon,
      deactivateCoupon,
      validateCoupon,  
      } = require("../services/coupon.service");

const addCoupon = asyncHandler(async (req, res) => {

    const coupon = await createCoupon(req.body);

    res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        coupon,
    });
});

const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await getAllCoupons();

    res.status(200).json({
        success: true,
        count: coupons.length,
        coupons,
    });
});

const getCoupon = asyncHandler(async (req, res) => {
    const { couponId } = req.params;

    const coupon = await getCouponById(couponId);

    res.status(200).json({
        success: true,
        coupon,
    });
});

const editCoupon = asyncHandler(async (req, res) => {
    const { couponId } = req.params;

    const coupon = await updateCoupon(
        couponId,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Coupon updated successfully",
        coupon,
    });
});

const disableCoupon = asyncHandler(async (req, res) => {
    const { couponId } = req.params;

    const coupon = await deactivateCoupon(couponId);

    res.status(200).json({
        success: true,
        message: "Coupon deactivated successfully",
        coupon,
    });
});

const checkCoupon = asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;

    const result = await validateCoupon(
        code,
        subtotal
    );

    res.status(200).json({
        success: true,
        message: "Coupon applied successfully",
        ...result,
    });
});



module.exports = {
    addCoupon,
    getCoupons,
    getCoupon,
    editCoupon,
    disableCoupon,
    checkCoupon,
};