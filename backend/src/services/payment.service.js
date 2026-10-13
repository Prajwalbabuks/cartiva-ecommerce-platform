const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const razorpay = require("../config/razorpay");
const AppError = require("../utils/AppError");

// Create or reuse a Razorpay order.
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
            "Cannot pay for a cancelled order",
            400
        );
    }

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

    if (
        !Number.isSafeInteger(amountInPaise) ||
        amountInPaise <= 0
    ) {
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

// Verify payment and complete checkout atomically.
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

    // Verify the signature returned by Razorpay Checkout.
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest();

    let receivedSignature;

    if (
        typeof razorpay_signature !== "string" ||
        !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
        throw new AppError("Invalid payment signature", 400);
    }

    receivedSignature = Buffer.from(
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

    // Independently confirm the payment with Razorpay.
    const payment = await razorpay.payments.fetch(
        razorpay_payment_id
    );

    if (payment.order_id !== razorpay_order_id) {
        throw new AppError(
            "Payment does not match the Razorpay order",
            400
        );
    }

    if (
        payment.amount !== Math.round(order.total * 100) ||
        payment.currency !== "INR"
    ) {
        throw new AppError(
            "Payment amount or currency mismatch",
            400
        );
    }

    if (payment.status !== "captured") {
        throw new AppError(
            "Payment is not captured yet",
            409
        );
    }

    // Aggregate quantities in case the same product appears
    // more than once in the order.
    const quantities = new Map();

    for (const item of order.items) {
        const productId = item.product.toString();

        quantities.set(
            productId,
            (quantities.get(productId) || 0) + item.quantity
        );
    }

    const session = await mongoose.startSession();
    let result;

    try {
        await session.withTransaction(async () => {
            // Reload the order inside the transaction.
            const currentOrder = await Order.findOne({
                _id: orderId,
                user: userId,
            }).session(session);

            if (!currentOrder) {
                throw new AppError("Order not found", 404);
            }

            if (
                currentOrder.payment?.razorpayOrderId !==
                razorpay_order_id
            ) {
                throw new AppError(
                    "Razorpay order ID mismatch",
                    400
                );
            }

            // Another request may already have completed checkout.
            if (
                currentOrder.paymentStatus === "paid" &&
                currentOrder.inventoryProcessed
            ) {
                result = {
                    orderId: currentOrder._id,
                    paymentStatus: currentOrder.paymentStatus,
                    status: currentOrder.status,
                    message: "Payment already verified",
                };

                return;
            }

            if (currentOrder.status === "cancelled") {
                throw new AppError(
                    "Cannot complete a cancelled order",
                    400
                );
            }

            // Deduct stock only when sufficient inventory remains.
            for (const [productId, quantity] of quantities) {
                const update = await Product.updateOne(
                    {
                        _id: productId,
                        stock: { $gte: quantity },
                    },
                    {
                        $inc: { stock: -quantity },
                    },
                    { session }
                );

                if (update.modifiedCount !== 1) {
                    throw new AppError(
                        `Insufficient stock for product ${productId}`,
                        409
                    );
                }
            }

            // Remove only the purchased quantities from the cart.
            // Items added after order creation are preserved.
            const cart = await Cart.findOne({
                user: userId,
            }).session(session);

            if (cart) {
                for (const [productId, purchasedQuantity] of quantities) {
                    const cartItem = cart.items.find(
                        (item) =>
                            item.product.toString() === productId
                    );

                    if (!cartItem) {
                        continue;
                    }

                    if (cartItem.quantity <= purchasedQuantity) {
                        cart.items = cart.items.filter(
                            (item) =>
                                item.product.toString() !== productId
                        );
                    } else {
                        cartItem.quantity -= purchasedQuantity;
                    }
                }

                await cart.save({ session });
            }

            currentOrder.payment.razorpayPaymentId =
                razorpay_payment_id;
            currentOrder.payment.razorpaySignature =
                razorpay_signature;
            currentOrder.paymentStatus = "paid";
            currentOrder.status = "confirmed";
            currentOrder.inventoryProcessed = true;

            await currentOrder.save({ session });

            result = {
                orderId: currentOrder._id,
                paymentStatus: currentOrder.paymentStatus,
                status: currentOrder.status,
                message: "Payment verified and checkout completed",
            };
        });
    } finally {
        await session.endSession();
    }

    return result;
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
};
