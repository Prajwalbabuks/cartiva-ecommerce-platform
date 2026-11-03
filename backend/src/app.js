
const express = require("express");
const cors = require("cors");

const authRouter = require("./routers/auth.route");
const categoryRouter = require("./routers/category.route");
const productRouter = require("./routers/product.route");
const cartRouter = require("./routers/cart.route");
const wishlistRouter = require("./routers/wishlist.route");
const addressRouter = require("./routers/address.route");
const couponRouter = require("./routers/coupon.route");
const orderRouter = require("./routers/order.route");
const paymentRouter = require("./routers/payment.route");
const reviewRouter = require("./routers/review.route");
const adminRouter = require("./routers/admin.route");
const adminProductRouter = require("./routers/admin.product.route");
const adminCategoryRoutes = require("./routers/admin.category.route.js");
const userRoutes = require("./routers/user.route.js");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// CORS configuration
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
    })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Cartiva API is running 🚀",
    });
});

// Customer routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/reviews", reviewRouter);

// Admin routes
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin/products", adminProductRouter);
app.use("/api/v1/admin/categories", adminCategoryRoutes);
app.use("/api/v1/admin/customers", userRoutes);

// Error handling middleware MUST be last
app.use(errorMiddleware);

module.exports = app;
