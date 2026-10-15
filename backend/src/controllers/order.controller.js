const asyncHandler = require("../utils/asyncHandler");
const { createOrder,
      getUserOrders,
      getOrderById,
      cancelOrder,
      updateOrderStatus
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
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
        !Number.isSafeInteger(page) ||
        !Number.isSafeInteger(limit) ||
        page < 1 ||
        limit < 1 ||
        limit > 100
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Page must be a positive integer and limit must be between 1 and 100",
        });
    }

    const result = await getUserOrders(
        req.user.userId,
        page,
        limit
    );

    res.status(200).json({
        success: true,
        ...result,
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

const cancelOrderByUser = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await cancelOrder(
        req.user.userId,
        orderId
    );

    res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        order,
    });
});

const updateOrderStatusByAdmin = asyncHandler(
    async (req, res) => {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await updateOrderStatus(
            orderId,
            status
        );

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order,
        });
    }
);

module.exports = {
    addOrder,
    getOrders,
    getOrder,
    cancelOrderByUser,
    updateOrderStatusByAdmin,
};