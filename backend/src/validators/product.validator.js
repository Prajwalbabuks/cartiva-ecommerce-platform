const { z } = require("zod");

const createProductSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Product name must be at least 2 characters")
        .max(150, "Product name cannot exceed 150 characters"),

    slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "Product slug must be at least 2 characters")
        .max(150, "Product slug cannot exceed 150 characters")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain only lowercase letters, numbers, and hyphens"
        ),

    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters"),

    brand: z
        .string()
        .trim()
        .max(50, "Brand name cannot exceed 50 characters")
        .optional(),

    category: z
        .string()
        .min(1, "Category is required"),

    price: z
        .number()
        .min(0, "Price cannot be negative"),

    discount: z
        .number()
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100")
        .default(0),

    stock: z
        .number()
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative"),

    sku: z
        .string()
        .trim()
        .toUpperCase()
        .min(2, "SKU must be at least 2 characters")
        .max(50, "SKU cannot exceed 50 characters"),

    images: z
        .array(z.string().url("Each image must be a valid URL"))
        .optional(),

    isActive: z
        .boolean()
        .optional(),

    isFeatured: z
        .boolean()
        .optional(),
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
    createProductSchema,
    updateProductSchema,
};