
const Category = require("../models/category");
const Product = require("../models/product");

const getAllCategoriesForAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      sort = "newest",
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Math.min(100, Number(limit) || 10));

    const filter = {};

    // Search categories by name
    if (search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // Filter by category status
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    // Sorting
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { name: 1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    const [categories, totalCategories] = await Promise.all([
      Category.find(filter)
        .sort(sortBy)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),

      Category.countDocuments(filter),
    ]);

    // Get product counts for displayed categories
    const categoryIds = categories.map((category) => category._id);

    const productCounts = await Product.aggregate([
      {
        $match: {
          category: { $in: categoryIds },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      productCounts.map((item) => [
        item._id.toString(),
        item.count,
      ])
    );

    // Get total products across ALL categories
      const allCategoryIds = await Category.distinct("_id");

      const totalProducts = await Product.countDocuments({
        category: { $in: allCategoryIds },
      });

    const categoriesWithCounts = categories.map((category) => ({
      ...category,
      productCount: countMap.get(category._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      message: "Admin categories fetched successfully",
      data: {
        categories: categoriesWithCounts,
        totalProducts,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCategories / limitNumber),
          totalCategories,
          limit: limitNumber,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Activate or deactivate category
const updateCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value",
      });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Category ${isActive ? "activated" : "deactivated"} successfully`,
      category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategoriesForAdmin,
  updateCategoryStatus,
};
