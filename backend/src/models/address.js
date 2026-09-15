const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
        },

        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [2, "Full name must be at least 2 characters"],
            maxlength: [100, "Full name cannot exceed 100 characters"],
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },

        addressLine1: {
            type: String,
            required: [true, "Address line 1 is required"],
            trim: true,
            maxlength: [200, "Address line 1 cannot exceed 200 characters"],
        },

        addressLine2: {
            type: String,
            trim: true,
            maxlength: [200, "Address line 2 cannot exceed 200 characters"],
            default: "",
        },

        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
            maxlength: [100, "City cannot exceed 100 characters"],
        },

        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
            maxlength: [100, "State cannot exceed 100 characters"],
        },

        postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            trim: true,
        },

        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true,
            default: "India",
        },

        addressType: {
            type: String,
            enum: ["home", "work", "other"],
            default: "home",
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;