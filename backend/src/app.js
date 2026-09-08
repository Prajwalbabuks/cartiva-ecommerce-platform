const express = require("express");

const authRouter = require("./routers/auth.route");
const categoryRouter = require("./routers/category.route");
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

// Error handling middleware MUST be last
app.use(errorMiddleware);

module.exports = app;