const asyncHandler = require("../utils/asyncHandler");

const {
    createRazorpayOrder,
    verifyRazorpayPayment,
} = require("../services/payment.service");


const createPaymentOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const payment = await createRazorpayOrder(
        req.user.userId,
        orderId
    );

    res.status(200).json({
        success: true,
        message: "Razorpay order created successfully",
        payment,
    });
});

const verifyPayment = asyncHandler(async (req, res) => {
    const result = await verifyRazorpayPayment(
        req.user.userId,
        req.body
    );

    res.status(200).json({
        success: true,
        ...result,
    });
});

module.exports = {
    createPaymentOrder,
    verifyPayment,
};