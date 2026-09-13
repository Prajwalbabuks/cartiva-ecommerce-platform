const asyncHandler = require("../utils/asyncHandler");

const {
    addItemToWishlist,
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

module.exports = {
    addToWishlist,
};