const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        message = "A resource with this value already exists";
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = errorMiddleware;