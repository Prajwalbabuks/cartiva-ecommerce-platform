const { z } = require("zod");

const createPaymentOrderSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
});

const verifyPaymentSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
});

module.exports = {
    createPaymentOrderSchema,
    verifyPaymentSchema,
};