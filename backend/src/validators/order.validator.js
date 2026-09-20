const { z } = require("zod");

const createOrderSchema = z.object({
    addressId: z.string().min(1, "Address ID is required"),

    couponCode: z
        .string()
        .trim()
        .toUpperCase()
        .min(3, "Coupon code must be at least 3 characters")
        .max(30, "Coupon code cannot exceed 30 characters")
        .optional(),
});

const updateOrderStatusSchema = z.object({
    status: z.enum([
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    ]),
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema,
};