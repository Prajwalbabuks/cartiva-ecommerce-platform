const express = require("express");

const {
    register,
    login,
    getMe,
    verifyEmail,
    resendVerificationEmail,
} = require("../controllers/auth.controller");

const validate = require("../middlewares/validate");
const {authMiddleware} = require("../middlewares/auth.middleware");
const authorizationMiddleware = require("../middlewares/authorize.middleware");

const {
    registerSchema,
    loginSchema
} = require("../validators/auth.validator.js");

const router = express.Router();

router.post("/verify-email", verifyEmail);

router.post("/resend-verification", resendVerificationEmail);

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
    getMe
);

module.exports = router;