const asyncHandler = require("../utils/asyncHandler");
const {
    addItemToCart,
    getUserCart,
    updateCartItem,
    removeItemFromCart,
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

const getCart = asyncHandler(async (req, res) => {
    const cart = await getUserCart(req.user.userId);

    res.status(200).json({
        success: true,
        ...cart,
    });
});

const updateCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await updateCartItem(
        req.user.userId,
        productId,
        quantity
    );

    res.status(200).json({
        success: true,
        message: "Cart item updated successfully",
        cart,
    });
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart = await removeItemFromCart(
        req.user.userId,
        productId
    );

    res.status(200).json({
        success: true,
        message: "Product removed from cart successfully",
        cart,
    });
});

module.exports = {
    addToCart,
    getCart,
    updateCart,
    removeFromCart,
};