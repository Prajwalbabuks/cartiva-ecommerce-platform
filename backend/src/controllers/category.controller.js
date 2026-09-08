const Category = require("../models/category");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const createCategory = asyncHandler(async (req, res) => {
    const { name, slug, description, image } = req.body;

    const existingCategory = await Category.findOne({
        $or: [{ name }, { slug }],
    });

    if (existingCategory) {
        throw new AppError(
            "Category with this name or slug already exists",
            409
        );
    }

    const category = await Category.create({
        name,
        slug,
        description,
        image,
    });

    res.status(201).json({
        success: true,
        message: "Category created successfully",
        category,
    });
});

module.exports = {
    createCategory,
};