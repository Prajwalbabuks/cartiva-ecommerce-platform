const asyncHandler = require("../utils/asyncHandler");

const {
    addItemToWishlist,
    getUserWishlist,
    removeItemFromWishlist,
    addWishlistItemToCart,
} = require("../services/wishlist.service");

const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    const wishlist = await addItemToWishlist(
        req.user.userId,
        productId
    );

    res.status(200).json({
        success: true,
        message: "Product added to wishlist successfully",
        wishlist,
    });
});

const getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await getUserWishlist(
        req.user.userId
    );

    res.status(200).json({
        success: true,
        ...wishlist,
    });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const wishlist = await removeItemFromWishlist(
        req.user.userId,
        productId
    );

    res.status(200).json({
        success: true,
        message: "Product removed from wishlist successfully",
        wishlist,
    });
});

const addToCartFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await addWishlistItemToCart(
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
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    addToCartFromWishlist,
};