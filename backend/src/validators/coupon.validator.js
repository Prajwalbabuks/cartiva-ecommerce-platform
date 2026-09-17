const { z } = require("zod");

const couponFields = z.object({
    code: z
        .string()
        .trim()
        .toUpperCase()
        .min(3)
        .max(30)
        .regex(
            /^[A-Z0-9_-]+$/,
            "Coupon code can contain only letters, numbers, hyphens and underscores"
        ),

    discountPercentage: z
        .number()
        .min(1)
        .max(100),

    minOrderValue: z
        .number()
        .min(0)
        .default(0),

    maxDiscount: z
        .number()
        .min(0)
        .nullable()
        .optional(),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),

    usageLimit: z
        .number()
        .int()
        .min(1)
        .nullable()
        .optional(),

    perUserLimit: z
        .number()
        .int()
        .min(1)
        .default(1),

    isActive: z.boolean().optional().default(true),
});

const createCouponSchema = couponFields.refine(
    (data) => data.endDate > data.startDate,
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
);

const updateCouponSchema = couponFields.partial().refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return data.endDate > data.startDate;
        }
        return true;
    },
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
);

const validateCouponSchema = z.object({
    code: z
        .string()
        .trim()
        .min(3)
        .max(30),

    subtotal: z
        .number()
        .min(0, "Subtotal cannot be negative"),
});

module.exports = {
    createCouponSchema,
    updateCouponSchema,
    validateCouponSchema,
};