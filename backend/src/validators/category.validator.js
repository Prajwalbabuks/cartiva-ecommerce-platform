const { z } = require("zod");

const createCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name cannot exceed 50 characters"),

    slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "Category slug must be at least 2 characters")
        .max(50, "Category slug cannot exceed 50 characters")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain only lowercase letters, numbers, and hyphens"
        ),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

    image: z
        .string()
        .url("Image must be a valid URL")
        .optional(),
});

const updateCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name cannot exceed 50 characters")
        .optional(),

    slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "Category slug must be at least 2 characters")
        .max(50, "Category slug cannot exceed 50 characters")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain only lowercase letters, numbers, and hyphens"
        )
        .optional(),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

    image: z
        .string()
        .url("Image must be a valid URL")
        .optional(),

    isActive: z
        .boolean()
        .optional(),
});

module.exports = {
    createCategorySchema,
    updateCategorySchema,
};