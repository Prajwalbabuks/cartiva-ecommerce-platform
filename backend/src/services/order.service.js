const mongoose = require("mongoose");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Address = require("../models/address");

const AppError = require("../utils/AppError");
const { validateCoupon } = require("./coupon.service");

const createOrder = async (userId, orderData) => {
    const cart = await Cart.findOne({
        user: userId,
    }).populate({
        path: "items.product",
        select: "name price discount stock isActive",
    });

    if (!cart || cart.items.length === 0) {
        throw new AppError("Your cart is empty", 400);
    }

    const address = await Address.findOne({
        _id: orderData.addressId,
        user: userId,
    });

    if (!address) {
        throw new AppError("Address not found", 404);
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
        const product = item.product;

        if (!product) {
            throw new AppError(
                "A product in your cart no longer exists",
                404
            );
        }

        if (!product.isActive) {
            throw new AppError(
                `${product.name} is no longer available`,
                400
            );
        }

        if (product.stock < item.quantity) {
            throw new AppError(
                `Only ${product.stock} units of ${product.name} are available`,
                400
            );
        }

        const finalPrice =
            product.price -
            (product.price * product.discount) / 100;

        const itemSubtotal =
            finalPrice * item.quantity;

        subtotal += itemSubtotal;

        orderItems.push({
            product: product._id,
            name: product.name,
            price: finalPrice,
            quantity: item.quantity,
            subtotal: itemSubtotal,
        });
    }

    let discount = 0;
    let couponSnapshot;

    if (orderData.couponCode) {
        const couponResult = await validateCoupon(
            orderData.couponCode,
            subtotal
        );

        discount = couponResult.discount;

        couponSnapshot = {
            couponId: couponResult.couponId,
            code: couponResult.code,
            discountPercentage:
                couponResult.discountPercentage,
        };
    }

    const total = subtotal - discount;

    const shippingAddress = {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
    };

    const order = await Order.create({
        user: userId,
        items: orderItems,
        shippingAddress,
        subtotal,
        discount,
        total,
        coupon: couponSnapshot,
        status: "pending",
        paymentStatus: "pending",
    });

    return order;
};


const getUserOrders = async (userId) => {
    const orders = await Order.find({
        user: userId,
    }).sort({
        createdAt: -1,
    });

    return orders;
};

const getOrderById = async (userId, orderId) => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    const order = await Order.findOne({
        _id: orderId,
        user: userId,
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    return order;
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
};