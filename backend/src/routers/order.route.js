const express = require("express");

const {
    addOrder,
    getOrders,
    getOrder,
    cancelOrderByUser,
    updateOrderStatusByAdmin,
    getAllOrders,
    getAdminOrderStatistics
} = require("../controllers/order.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate");

const {
    createOrderSchema,
    updateOrderStatusSchema
} = require("../validators/order.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(createOrderSchema),
    addOrder
);

router.get(
    "/",
    authMiddleware,
    getOrders
);

router.patch(
    "/:orderId/cancel",
    authMiddleware,
    cancelOrderByUser
);

router.patch(
    "/:orderId/status",
    authMiddleware,
    authorize("admin"),
    validate(updateOrderStatusSchema),
    updateOrderStatusByAdmin
);

router.get(
    "/admin/all",
    authMiddleware,
    authorize("admin"),
    getAllOrders
);

router.get(
    "/:orderId",
    authMiddleware,
    getOrder
);

router.get(
    "/admin/stats",
    authMiddleware,
    authorize("admin"),
    getAdminOrderStatistics
);

module.exports = router;