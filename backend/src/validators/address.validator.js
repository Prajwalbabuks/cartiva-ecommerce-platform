const { z } = require("zod");

const createAddressSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name cannot exceed 100 characters"),

    phone: z
        .string()
        .trim()
        .regex(
            /^[6-9]\d{9}$/,
            "Please provide a valid Indian phone number"
        ),

    addressLine1: z
        .string()
        .trim()
        .min(5, "Address line 1 is required")
        .max(200),

    addressLine2: z
        .string()
        .trim()
        .max(200)
        .optional(),

    city: z
        .string()
        .trim()
        .min(2)
        .max(100),

    state: z
        .string()
        .trim()
        .min(2)
        .max(100),

    postalCode: z
        .string()
        .trim()
        .regex(
            /^[1-9][0-9]{5}$/,
            "Please provide a valid Indian postal code"
        ),

    country: z
        .string()
        .trim()
        .default("India"),

    addressType: z
        .enum(["home", "work", "other"])
        .default("home"),

    isDefault: z
        .boolean()
        .optional(),
});

module.exports = {
    createAddressSchema,
};