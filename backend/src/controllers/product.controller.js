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

const getProducts = asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
        Math.max(Number(req.query.limit) || 10, 1),
        50
    );

    const skip = (page - 1) * limit;

    const filter = {
        isActive: true,
    };

    if (req.query.search) {
        filter.name = {
            $regex: req.query.search,
            $options: "i",
        };
    }

    if (req.query.category) {
    if (!mongoose.Types.ObjectId.isValid(req.query.category)) {
        throw new AppError("Invalid category ID", 400);
    }

    filter.category = req.query.category;
    }

    if (req.query.minPrice !== undefined) {
    const minPrice = Number(req.query.minPrice);

    if (Number.isNaN(minPrice) || minPrice < 0) {
        throw new AppError("Invalid minimum price", 400);
    }

    filter.price = {
        ...filter.price,
        $gte: minPrice,
    };
   }

    if (req.query.maxPrice !== undefined) {
        const maxPrice = Number(req.query.maxPrice);

        if (Number.isNaN(maxPrice) || maxPrice < 0) {
            throw new AppError("Invalid maximum price", 400);
        }

        filter.price = {
            ...filter.price,
            $lte: maxPrice,
        };
    }

    let sort = { createdAt: -1 };

    if (req.query.sort === "price_asc") {
        sort = { price: 1 };
    }

    if (req.query.sort === "price_desc") {
        sort = { price: -1 };
    }

    if (req.query.sort === "oldest") {
        sort = { createdAt: 1 };
    }

    const [products, totalProducts] = await Promise.all([
        Product.find(filter)
            .populate("category", "name slug")
            .sort(sort)
            .skip(skip)
            .limit(limit),

        Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
        success: true,
        count: products.length,
        pagination: {
            currentPage: page,
            limit,
            totalProducts,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
        products,
    });
});


const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid product ID", 400);
    }

    const product = await Product.findOne({
        _id: id,
        isActive: true,
    }).populate("category", "name slug");

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    res.status(200).json({
        success: true,
        product,
    });
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid product ID", 400);
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

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

    // If category is being changed, verify it exists and is active
    if (category !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
            throw new AppError("Invalid category ID", 400);
        }

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

        product.category = category;
    }

    if (name !== undefined) product.name = name;
    if (slug !== undefined) product.slug = slug;
    if (description !== undefined) product.description = description;
    if (brand !== undefined) product.brand = brand;
    if (price !== undefined) product.price = price;
    if (discount !== undefined) product.discount = discount;
    if (stock !== undefined) product.stock = stock;
    if (sku !== undefined) product.sku = sku;
    if (images !== undefined) product.images = images;
    if (isActive !== undefined) product.isActive = isActive;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;

    const updatedProduct = await product.save();

    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
    });
});

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
};
