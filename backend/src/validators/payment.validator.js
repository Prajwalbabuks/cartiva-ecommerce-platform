const { z } = require("zod");

const createPaymentOrderSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
});

module.exports = {
    createPaymentOrderSchema,
};