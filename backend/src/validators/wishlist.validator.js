const { z } = require("zod");

const addToWishlistSchema = z.object({
    productId: z
        .string()
        .min(1, "Product ID is required"),
});

module.exports = {
    addToWishlistSchema,
};