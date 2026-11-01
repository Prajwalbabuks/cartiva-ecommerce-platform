
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const Category = require("../models/category");
const Coupon = require("../models/coupon");

const getDashboardOverview = async () => {
    const LOW_STOCK_THRESHOLD = 5;

    const [
        totalRevenue,
        totalOrders,
        paidOrders,
        pendingOrders,
        totalCustomers,
        activeCustomers,
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalCategories,
        activeCategories,
        totalCoupons,
        activeCoupons,
        recentOrders,
    ] = await Promise.all([
        // Revenue from successfully paid orders only
        Order.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                },
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$total" },
                },
            },
        ]),

        Order.countDocuments(),

        Order.countDocuments({
            paymentStatus: "paid",
        }),

        Order.countDocuments({
            status: "pending",
        }),

        User.countDocuments({
            role: "user",
        }),

        User.countDocuments({
            role: "user",
            isActive: true,
        }),

        Product.countDocuments(),

        Product.countDocuments({
            isActive: true,
        }),

        Product.countDocuments({
            isActive: true,
            stock: { $lte: LOW_STOCK_THRESHOLD },
        }),

        Category.countDocuments(),

        Category.countDocuments({
            isActive: true,
        }),

        Coupon.countDocuments(),

        Coupon.countDocuments({
            isActive: true,
        }),

        // Latest five orders
        Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(5)
            .select(
                "user items total status paymentStatus createdAt"
            )
            .lean(),
    ]);

    return {
        overview: {
            revenue: totalRevenue[0]?.revenue || 0,

            orders: {
                total: totalOrders,
                paid: paidOrders,
                pending: pendingOrders,
            },

            customers: {
                total: totalCustomers,
                active: activeCustomers,
            },

            products: {
                total: totalProducts,
                active: activeProducts,
                lowStock: lowStockProducts,
                lowStockThreshold: LOW_STOCK_THRESHOLD,
            },

            categories: {
                total: totalCategories,
                active: activeCategories,
            },

            coupons: {
                total: totalCoupons,
                active: activeCoupons,
            },
        },

        recentOrders,
    };
};

module.exports = {
    getDashboardOverview,
};
