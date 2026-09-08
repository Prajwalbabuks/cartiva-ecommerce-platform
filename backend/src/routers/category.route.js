const express = require("express");

const {
    createCategory,
} = require("../controllers/category.controller");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const {
    createCategorySchema,
} = require("../validators/category.validator");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorize("admin"),
    validate(createCategorySchema),
    createCategory
);

module.exports = router;