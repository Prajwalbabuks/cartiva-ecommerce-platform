const asyncHandler = require("../utils/asyncHandler");

const {
    createAddress,
    getUserAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
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

const getAddresses = asyncHandler(async (req, res) => {
    const addresses = await getUserAddresses(
        req.user.userId
    );

    res.status(200).json({
        success: true,
        count: addresses.length,
        addresses,
    });
});

const editAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const address = await updateAddress(
        req.user.userId,
        addressId,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Address updated successfully",
        address,
    });
});

const removeAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    await deleteAddress(
        req.user.userId,
        addressId
    );

    res.status(200).json({
        success: true,
        message: "Address deleted successfully",
    });
});

const makeDefaultAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const address = await setDefaultAddress(
        req.user.userId,
        addressId
    );

    res.status(200).json({
        success: true,
        message: "Default address updated successfully",
        address,
    });
});

module.exports = {
    addAddress,
    getAddresses,
    editAddress,
    removeAddress,
    makeDefaultAddress,
};
