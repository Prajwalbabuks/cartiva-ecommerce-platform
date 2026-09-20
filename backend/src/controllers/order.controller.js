const asyncHandler = require("../utils/asyncHandler");
const { createOrder,
      getUserOrders,
      getOrderById
} = require("../services/order.service");

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

const getOrders = asyncHandler(async (req, res) => {
    const orders = await getUserOrders(
        req.user.userId
    );

    res.status(200).json({
        success: true,
        count: orders.length,
        orders,
    });
});

const getOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await getOrderById(
        req.user.userId,
        orderId
    );

    res.status(200).json({
        success: true,
        order,
    });
});

module.exports = {
    addOrder,
    getOrders,
    getOrder,
};