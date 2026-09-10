const mongoose = require("mongoose");

const Product = require("../models/product");
const Category = require("../models/category");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        slug,
        description,
        brand,
        category,
        price,
        discount,
        stock,
        sku,
        images,
        isActive,
        isFeatured,
    } = req.body;

    // Check whether category ID is valid
    if (!mongoose.Types.ObjectId.isValid(category)) {
        throw new AppError("Invalid category ID", 400);
    }

    // Check whether category exists and is active
    const existingCategory = await Category.findOne({
        _id: category,
        isActive: true,
    });

    if (!existingCategory) {
        throw new AppError(
            "Category not found or inactive",
            404
        );
    }

    // Create product
    const product = await Product.create({
        name,
        slug,
        description,
        brand,
        category,
        price,
        discount,
        stock,
        sku,
        images,
        isActive,
        isFeatured,
    });

    res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
    });
});

module.exports = {
    createProduct,
};