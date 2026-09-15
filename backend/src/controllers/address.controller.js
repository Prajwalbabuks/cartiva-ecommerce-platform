const asyncHandler = require("../utils/asyncHandler");

const {
    createAddress,
} = require("../services/address.service");

const addAddress = asyncHandler(async (req, res) => {
    const address = await createAddress(
        req.user.userId,
        req.body
    );

    res.status(201).json({
        success: true,
        message: "Address added successfully",
        address,
    });
});

module.exports = {
    addAddress,
};