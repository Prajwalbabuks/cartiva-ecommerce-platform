const express = require("express");

const {
    register,
    login,
    getMe
} = require("../controllers/auth.controller");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizationMiddleware = require("../middlewares/authorize.middleware");

const {
    registerSchema,
    loginSchema
} = require("../validators/auth.validator.js");

const router = express.Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.get(
    "/me",
    authMiddleware,
    authorizationMiddleware("admin"),
    getMe
);

module.exports = router;