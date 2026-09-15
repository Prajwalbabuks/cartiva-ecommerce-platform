const express = require("express");

const {
    addAddress,
    getAddresses,
    editAddress,
    removeAddress,
    makeDefaultAddress,
} = require("../controllers/address.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate");

const {
    createAddressSchema,
    updateAddressSchema,
} = require("../validators/address.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(createAddressSchema),
    addAddress
);

router.get(
    "/",
    authMiddleware,
    getAddresses
);

router.patch(
    "/:addressId/default",
    authMiddleware,
    makeDefaultAddress
);

router.patch(
    "/:addressId",
    authMiddleware,
    validate(updateAddressSchema),
    editAddress
);

router.delete(
    "/:addressId",
    authMiddleware,
    removeAddress
);



module.exports = router;