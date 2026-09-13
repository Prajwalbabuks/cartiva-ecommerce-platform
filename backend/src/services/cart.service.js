const Cart = require("../models/cart");
const Product = require("../models/product");
const AppError = require("../utils/AppError");

const addItemToCart = async (userId, productId, quantity) => {
    const product = await Product.findOne({
        _id: productId,
        isActive: true,
    });

    if (!product) {
        throw new AppError("Product not found or inactive", 404);
    }

    if (product.stock < quantity) {
        throw new AppError(
            `Only ${product.stock} items are available`,
            400
        );
    }

    let cart = await Cart.findOne({
        user: userId,
    });

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [
                {
                    product: productId,
                    quantity,
                },
            ],
        });

        return cart;
    }

    const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
    );

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
            throw new AppError(
                `Only ${product.stock} items are available`,
                400
            );
        }

        existingItem.quantity = newQuantity;
    } else {
        cart.items.push({
            product: productId,
            quantity,
        });
    }

    await cart.save();

    return cart;
};

const getUserCart = async (userId) => {
    const cart = await Cart.findOne({
        user: userId,
    }).populate({
        path: "items.product",
        select: "name slug price discount stock images isActive",
    });

    if (!cart) {
        return {
            items: [],
            subtotal: 0,
            totalItems: 0,
        };
    }

    let subtotal = 0;
    let totalItems = 0;

    for (const item of cart.items) {
        const product = item.product;

        if (!product) {
            continue;
        }

        const discountedPrice =
            product.price -
            (product.price * product.discount) / 100;

        subtotal += discountedPrice * item.quantity;
        totalItems += item.quantity;
    }

    return {
        cart,
        subtotal,
        totalItems,
    };
};

const updateCartItem = async (userId, productId, quantity) => {
    const cart = await Cart.findOne({
        user: userId,
    });

    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    const cartItem = cart.items.find(
        (item) => item.product.toString() === productId
    );

    if (!cartItem) {
        throw new AppError("Product is not in the cart", 404);
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

    if (quantity > product.stock) {
        throw new AppError(
            `Only ${product.stock} items are available`,
            400
        );
    }

    cartItem.quantity = quantity;

    await cart.save();

    return cart;
};

const removeItemFromCart = async (userId, productId) => {
    const cart = await Cart.findOne({
        user: userId,
    });

    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        throw new AppError("Product is not in the cart", 404);
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

    return cart;
};

module.exports = {
    addItemToCart,
    getUserCart,
    updateCartItem,
    removeItemFromCart,
};
