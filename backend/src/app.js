const express = require("express");

const authRouter = require("./routers/auth.route");
const categoryRouter = require("./routers/category.route");
const productRouter = require("./routers/product.route");
const cartRouter = require("./routers/cart.route"); 
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Cartiva API is running 🚀",
    });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
// Error handling middleware MUST be last
app.use(errorMiddleware);

module.exports = app;