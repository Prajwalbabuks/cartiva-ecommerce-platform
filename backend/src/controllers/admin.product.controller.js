const Product = require("../models/product");
const asyncHandler = require("../utils/asyncHandler");

// Get all products for admin
const getAllProductsForAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    status,
    sort = "newest",
  } = req.query;

  const filter = {};

  // Search by product name
  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  // Filter by category
  if (category) {
    filter.category = category;
  }

  // Filter by product status
  if (status === "active") {
    filter.isActive = true;
  } else if (status === "inactive") {
    filter.isActive = false;
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    name: { name: 1 },
  };

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean(),

    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "Admin products fetched successfully",
    data: {
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        totalProducts,
        limit: limitNumber,
      },
    },
  });
});

// Activate or deactivate product
const updateProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isActive must be a boolean value",
    });
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { isActive },
    {
    returnDocument: "after",
    runValidators: true,
   }
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    message: `Product ${isActive ? "activated" : "deactivated"} successfully`,
    data: product,
  });
});

module.exports = {
  getAllProductsForAdmin,
  updateProductStatus,
};