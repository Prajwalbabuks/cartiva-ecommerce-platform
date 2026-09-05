const express = require("express");

const authRouter = require("./routers/auth.route.js");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Cartiva API is running 🚀",
    });
});

app.use("/api/v1/auth", authRouter);

module.exports = app;