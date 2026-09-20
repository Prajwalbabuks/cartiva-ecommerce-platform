const asyncHandler = require("../utils/asyncHandler");
const { createOrder } = require("../services/order.service");

const addOrder = asyncHandler(async (req, res) => {
    const order = await createOrder(
        req.user.userId,
        req.body
    );

    res.status(201).json({
        success: true,
        message: "Order created successfully",
        order,
    });
});

module.exports = {
    addOrder,
};