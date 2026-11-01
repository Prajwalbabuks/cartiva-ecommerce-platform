
const asyncHandler = require("../utils/asyncHandler");

const {
    getDashboardOverview,
} = require("../services/admin.service");

const getDashboard = asyncHandler(async (req, res) => {
    const dashboard = await getDashboardOverview();

    res.status(200).json({
        success: true,
        message: "Dashboard overview fetched successfully",
        data: dashboard,
    });
});

module.exports = {
    getDashboard,
};
