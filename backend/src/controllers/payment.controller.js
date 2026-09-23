const asyncHandler = require("../utils/asyncHandler");

const {
    createRazorpayOrder,
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

module.exports = {
    createPaymentOrder,
};