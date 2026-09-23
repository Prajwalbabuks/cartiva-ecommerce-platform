const mongoose = require("mongoose");

const Order = require("../models/order");
const razorpay = require("../config/razorpay");
const AppError = require("../utils/AppError");

const createRazorpayOrder = async (userId, orderId) => {
    // 1. Validate Cartiva Order ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    // 2. Find the Cartiva order belonging to the logged-in user
    const order = await Order.findOne({
        _id: orderId,
        user: userId,
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    // 3. Don't create another payment order for an already paid order
    if (order.paymentStatus === "paid") {
        throw new AppError(
            "This order has already been paid",
            400
        );
    }

    // 4. Don't create a Razorpay order for a cancelled order
    if (order.status === "cancelled") {
        throw new AppError(
            "Cannot make payment for a cancelled order",
            400
        );
    }

    // 5. If a Razorpay order already exists, return it
    if (order.payment?.razorpayOrderId) {
        return {
            orderId: order._id,
            razorpayOrderId: order.payment.razorpayOrderId,
            amount: Math.round(order.total * 100),
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
        };
    }

    // 6. Convert Cartiva amount from rupees to paise
    const amountInPaise = Math.round(order.total * 100);

    console.log("Cartiva order total:", order.total);
    console.log("Razorpay amount in paise:", amountInPaise);

    // 7. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: order._id.toString(),
        notes: {
            cartivaOrderId: order._id.toString(),
            userId: userId.toString(),
        },
    });

    // 8. Store Razorpay Order ID inside Cartiva Order
    order.payment.razorpayOrderId = razorpayOrder.id;

    await order.save();

    // 9. Return only the information required by the frontend
    return {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
    };
};

module.exports = {
    createRazorpayOrder,
};