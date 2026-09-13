const express = require("express");

const {
    createProduct,
    getProducts,
} = require("../controllers/product.controller");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const {
    createProductSchema,
} = require("../validators/product.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorize("admin"),
    validate(createProductSchema),
    createProduct
);

router.get("/", 
      getProducts
);

module.exports = router;