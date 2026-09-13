const asyncHandler = require("../utils/asyncHandler");
const {
    addItemToCart,
} = require("../services/cart.service");

const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    const cart = await addItemToCart(
        req.user.userId,
        productId,
        quantity
    );

    res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
        cart,
    });
});

module.exports = {
    addToCart,
};