const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../models/order");
const razorpay = require("../config/razorpay");
const AppError = require("../utils/AppError");

// Create a Razorpay order for an existing Cartiva order.
const createRazorpayOrder = async (userId, orderId) => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    const order = await Order.findOne({
        _id: orderId,
        user: userId,
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (order.paymentStatus === "paid") {
        throw new AppError("This order has already been paid", 400);
    }

    if (order.status === "cancelled") {
        throw new AppError(
            "Cannot make payment for a cancelled order",
            400
        );
    }

    // Reuse the Razorpay order if one was already created.
    if (order.payment?.razorpayOrderId) {
        return {
            orderId: order._id,
            razorpayOrderId: order.payment.razorpayOrderId,
            amount: Math.round(order.total * 100),
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
        };
    }

    const amountInPaise = Math.round(order.total * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
        throw new AppError("Invalid order amount", 400);
    }

    const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: order._id.toString(),
        notes: {
            cartivaOrderId: order._id.toString(),
            userId: userId.toString(),
        },
    });

    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
    };
};

// Verify the signature and confirm the payment with Razorpay.
const verifyRazorpayPayment = async (userId, paymentData) => {
    const {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = paymentData;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    const order = await Order.findOne({
        _id: orderId,
        user: userId,
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (order.status === "cancelled") {
        throw new AppError(
            "Cannot verify payment for a cancelled order",
            400
        );
    }

    if (order.payment?.razorpayOrderId !== razorpay_order_id) {
        throw new AppError("Razorpay order ID mismatch", 400);
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
        throw new AppError(
            "Payment verification is not configured",
            500
        );
    }

    // Razorpay signature = HMAC-SHA256(order_id|payment_id, key_secret).
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest();

    const receivedSignature = Buffer.from(
        razorpay_signature,
        "hex"
    );

    if (
        receivedSignature.length !== expectedSignature.length ||
        !crypto.timingSafeEqual(
            receivedSignature,
            expectedSignature
        )
    ) {
        throw new AppError("Invalid payment signature", 400);
    }

    // Independently check the payment against Razorpay's API.
    const payment = await razorpay.payments.fetch(
        razorpay_payment_id
    );

    if (payment.order_id !== razorpay_order_id) {
        throw new AppError(
            "Payment does not match the Razorpay order",
            400
        );
    }

    const expectedAmount = Math.round(order.total * 100);

    if (
        payment.amount !== expectedAmount ||
        payment.currency !== "INR"
    ) {
        throw new AppError("Payment amount or currency mismatch", 400);
    }

    // Don't mark an authorized or failed payment as paid.
    if (payment.status !== "captured") {
        throw new AppError(
            "Payment is not captured yet",
            409
        );
    }

    // Safe retry for the same successfully verified payment.
    if (order.paymentStatus === "paid") {
        if (order.payment.razorpayPaymentId === razorpay_payment_id) {
            return {
                orderId: order._id,
                paymentStatus: order.paymentStatus,
                status: order.status,
                message: "Payment already verified",
            };
        }

        throw new AppError("Order has already been paid", 400);
    }

    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.paymentStatus = "paid";
    order.status = "confirmed";

    await order.save();

    return {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        status: order.status,
        message: "Payment verified successfully",
    };
};
module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
};