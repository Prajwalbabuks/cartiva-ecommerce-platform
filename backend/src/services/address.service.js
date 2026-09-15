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

module.exports = {
    createAddress,
};