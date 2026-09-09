const mongoose = require("mongoose");
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

const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({
        isActive: true,
    }).sort({ name: 1 });

    res.status(200).json({
        success: true,
        count: categories.length,
        categories,
    });
});

const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid category ID", 400);
    }

    const category = await Category.findOne({
        _id: id,
        isActive: true,
    });

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    res.status(200).json({
        success: true,
        category,
    });
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid category ID", 400);
    }

    const { name, slug, description, image, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    if (name !== undefined) {
        category.name = name;
    }

    if (slug !== undefined) {
        category.slug = slug;
    }

    if (description !== undefined) {
        category.description = description;
    }

    if (image !== undefined) {
        category.image = image;
    }

    if (isActive !== undefined) {
        category.isActive = isActive;
    }

    const updatedCategory = await category.save();

    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category: updatedCategory,
    });
});

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
};