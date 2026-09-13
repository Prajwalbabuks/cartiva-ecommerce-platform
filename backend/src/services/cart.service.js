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

module.exports = {
    addItemToCart,
};