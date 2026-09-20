const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: false,
    }
);

const shippingAddressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            required: true,
        },

        addressLine1: {
            type: String,
            required: true,
        },

        addressLine2: {
            type: String,
            default: "",
        },

        city: {
            type: String,
            required: true,
        },

        state: {
            type: String,
            required: true,
        },

        postalCode: {
            type: String,
            required: true,
        },

        country: {
            type: String,
            default: "India",
        },
    },
    {
        _id: false,
    }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must contain at least one item",
            },
        },

        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        coupon: {
            couponId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Coupon",
            },

            code: {
                type: String,
            },

            discountPercentage: {
                type: Number,
            },
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded",
            ],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;