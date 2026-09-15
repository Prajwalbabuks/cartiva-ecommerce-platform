const express = require("express");

const {
    addAddress,
} = require("../controllers/address.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate");

const {
    createAddressSchema,
} = require("../validators/address.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(createAddressSchema),
    addAddress
);

module.exports = router;