const mongoose = require("mongoose");

const {
    addItemToCart,
} = require("./cart.service");

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

const getUserWishlist = async (userId) => {
    const wishlist = await Wishlist.findOne({
        user: userId,
    }).populate({
        path: "products",
        select: "name slug price discount stock images isActive",
    });

    if (!wishlist) {
        return {
            products: [],
            totalProducts: 0,
        };
    }

    return {
        wishlist,
        totalProducts: wishlist.products.length,
    };
};

const removeItemFromWishlist = async (userId, productId) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product ID", 400);
    }

    const wishlist = await Wishlist.findOne({
        user: userId,
    });

    if (!wishlist) {
        throw new AppError("Wishlist not found", 404);
    }

    const itemIndex = wishlist.products.findIndex(
        (product) => product.toString() === productId
    );

    if (itemIndex === -1) {
        throw new AppError(
            "Product is not in your wishlist",
            404
        );
    }

    wishlist.products.splice(itemIndex, 1);

    await wishlist.save();

    return wishlist;
};

const addWishlistItemToCart = async (
    userId,
    productId,
    quantity = 1
) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product ID", 400);
    }

    const wishlist = await Wishlist.findOne({
        user: userId,
    });

    if (!wishlist) {
        throw new AppError("Wishlist not found", 404);
    }

    const itemExists = wishlist.products.some(
        (product) => product.toString() === productId
    );

    if (!itemExists) {
        throw new AppError(
            "Product is not in your wishlist",
            404
        );
    }

    const cart = await addItemToCart(
        userId,
        productId,
        quantity
    );

    return cart;
};

module.exports = {
    addItemToWishlist,
    getUserWishlist,
    removeItemFromWishlist,
    addWishlistItemToCart,
};