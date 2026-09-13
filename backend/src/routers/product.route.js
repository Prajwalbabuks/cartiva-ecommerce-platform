const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
} = require("../controllers/product.controller");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const {
    createProductSchema,
    updateProductSchema,
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

router.get(
    "/:id",
    getProductById
);

router.patch(
    "/:id",
    authMiddleware,
    authorize("admin"),
    validate(updateProductSchema),
    updateProduct
);



module.exports = router;