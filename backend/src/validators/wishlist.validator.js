const { z } = require("zod");

const addToWishlistSchema = z.object({
    productId: z
        .string()
        .min(1, "Product ID is required"),
});

const addWishlistItemToCartSchema = z.object({
    quantity: z
        .number()
        .int("Quantity must be an integer")
        .min(1, "Quantity must be at least 1"),
});

module.exports = {
    addToWishlistSchema,
    addWishlistItemToCartSchema,
};