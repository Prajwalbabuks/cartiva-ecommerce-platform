const mongoose = require("mongoose");
const Address = require("../models/address");
const AppError = require("../utils/AppError");

const createAddress = async (userId, addressData) => {
    const existingAddresses = await Address.countDocuments({
        user: userId,
    });

    const shouldBeDefault =
        existingAddresses === 0 || addressData.isDefault === true;

    if (shouldBeDefault) {
        await Address.updateMany(
            { user: userId },
            { $set: { isDefault: false } }
        );
    }

    const address = await Address.create({
        ...addressData,
        user: userId,
        isDefault: shouldBeDefault,
    });

    return address;
};

const getUserAddresses = async (userId) => {
    const addresses = await Address.find({
        user: userId,
    }).sort({
        isDefault: -1,
        createdAt: -1,
    });

    return addresses;
};

const updateAddress = async (userId, addressId, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
        throw new AppError("Invalid address ID", 400);
    }

    const address = await Address.findOne({
        _id: addressId,
        user: userId,
    });

    if (!address) {
        throw new AppError("Address not found", 404);
    }

    const wantsToBeDefault = updateData.isDefault === true;

    if (wantsToBeDefault) {
        await Address.updateMany(
            {
                user: userId,
                _id: { $ne: addressId },
            },
            {
                $set: { isDefault: false },
            }
        );
    }

    Object.assign(address, updateData);

    if (wantsToBeDefault) {
        address.isDefault = true;
    }

    await address.save();

    return address;
};

const deleteAddress = async (userId, addressId) => {
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
        throw new AppError("Invalid address ID", 400);
    }

    const address = await Address.findOne({
        _id: addressId,
        user: userId,
    });

    if (!address) {
        throw new AppError("Address not found", 404);
    }

    await Address.deleteOne({
        _id: addressId,
        user: userId,
    });

    if (address.isDefault) {
        const nextAddress = await Address.findOne({
            user: userId,
        }).sort({
            createdAt: -1,
        });

        if (nextAddress) {
            nextAddress.isDefault = true;
            await nextAddress.save();
        }
    }

    return address;
};

const setDefaultAddress = async (userId, addressId) => {
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
        throw new AppError("Invalid address ID", 400);
    }

    const address = await Address.findOne({
        _id: addressId,
        user: userId,
    });

    if (!address) {
        throw new AppError("Address not found", 404);
    }

    await Address.updateMany(
        {
            user: userId,
        },
        {
            $set: {
                isDefault: false,
            },
        }
    );

    address.isDefault = true;

    await address.save();

    return address;
};

module.exports = {
    createAddress,
    getUserAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};