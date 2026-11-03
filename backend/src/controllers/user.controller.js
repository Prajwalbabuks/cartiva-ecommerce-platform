
const mongoose = require("mongoose");
const User = require("../models/user");

const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// GET /api/v1/admin/customers
const getAllCustomers = async (req, res) => {
    try {
        const {
            search = "",
            status = "all",
            verification = "all",
            sort = "newest",
            page = 1,
            limit = 10,
        } = req.query;

        const currentPage = Math.max(1, Number(page) || 1);
        const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));

        const filter = { role: "user" };

        if (search.trim()) {
            const searchRegex = new RegExp(
                escapeRegex(search.trim()),
                "i"
            );

            filter.$or = [
                { name: searchRegex },
                { email: searchRegex },
            ];
        }

        if (status === "active") filter.isActive = true;
        if (status === "inactive") filter.isActive = false;

        if (verification === "verified") {
            filter.isEmailVerified = true;
        }

        if (verification === "unverified") {
            filter.isEmailVerified = false;
        }

        const sortOption =
            sort === "oldest"
                ? { createdAt: 1 }
                : { createdAt: -1 };

        const skip = (currentPage - 1) * pageLimit;

        const [
            customers,
            filteredTotal,
            totalCustomers,
            activeCustomers,
            inactiveCustomers,
            verifiedCustomers,
        ] = await Promise.all([
            User.find(filter)
                .select("-password")
                .sort(sortOption)
                .skip(skip)
                .limit(pageLimit)
                .lean(),

            User.countDocuments(filter),
            User.countDocuments({ role: "user" }),
            User.countDocuments({ role: "user", isActive: true }),
            User.countDocuments({ role: "user", isActive: false }),
            User.countDocuments({
                role: "user",
                isEmailVerified: true,
            }),
        ]);

        return res.status(200).json({
            success: true,
            customers,
            pagination: {
                currentPage,
                totalPages: Math.ceil(filteredTotal / pageLimit),
                totalCustomers: filteredTotal,
                limit: pageLimit,
            },
            stats: {
                totalCustomers,
                activeCustomers,
                inactiveCustomers,
                verifiedCustomers,
                unverifiedCustomers: totalCustomers - verifiedCustomers,
            },
        });
    } catch (error) {
        console.error("Get all customers error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customers.",
        });
    }
};

// GET /api/v1/admin/customers/:customerId
const getCustomerById = async (req, res) => {
    try {
        const { customerId } = req.params;

        if (!mongoose.isValidObjectId(customerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID.",
            });
        }

        const customer = await User.findOne({
            _id: customerId,
            role: "user",
        })
            .select("-password")
            .lean();

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found.",
            });
        }

        return res.status(200).json({
            success: true,
            customer,
        });
    } catch (error) {
        console.error("Get customer details error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer details.",
        });
    }
};

// PATCH /api/v1/admin/customers/:customerId/status
const updateCustomerStatus = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { isActive } = req.body;

        if (!mongoose.isValidObjectId(customerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID.",
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false.",
            });
        }

        const customer = await User.findOneAndUpdate(
            {
                _id: customerId,
                role: "user",
            },
            { $set: { isActive } },
            { new: true, runValidators: true }
        ).select("-password");

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Customer ${isActive ? "activated" : "deactivated"} successfully.`,
            customer,
        });
    } catch (error) {
        console.error("Update customer status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update customer status.",
        });
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    updateCustomerStatus,
};
