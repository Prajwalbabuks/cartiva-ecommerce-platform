const express = require("express");

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
} = require("../controllers/category.controller");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const {
    createCategorySchema,
    updateCategorySchema
} = require("../validators/category.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorize("admin"),
    validate(createCategorySchema),
    createCategory
);

router.get(
    "/",
    getCategories
);

router.get(
    "/:id",
    getCategoryById
);

router.patch(
    "/:id",
    authMiddleware,
    authorize("admin"),
    validate(updateCategorySchema),
    updateCategory
);

module.exports = router;