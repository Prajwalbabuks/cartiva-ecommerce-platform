const mongoose = require("mongoose");

const Wishlist = require("../models/wishlist");
const Product = require("../models/product");
const AppError = require("../utils/AppError");

const addItemToWishlist = async (userId, productId) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product ID", 400);
    }

    const product = await Product.findOne({
        _id: productId,
        isActive: true,
    });

    if (!product) {
        throw new AppError(
            "Product not found or inactive",
            404
        );
    }

    let wishlist = await Wishlist.findOne({
        user: userId,
    });

    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: userId,
            products: [productId],
        });

        return wishlist;
    }

    const alreadyExists = wishlist.products.some(
        (product) => product.toString() === productId
    );

    if (alreadyExists) {
        throw new AppError(
            "Product is already in your wishlist",
            409
        );
    }

    wishlist.products.push(productId);

    await wishlist.save();

    return wishlist;
};

module.exports = {
    addItemToWishlist,
};