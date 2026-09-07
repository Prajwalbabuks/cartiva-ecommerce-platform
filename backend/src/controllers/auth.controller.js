const User = require("../models/user");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("User already exists", 409);
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User
        .findOne({ email })
        .select("+password");

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
        throw new AppError("Your account is inactive", 403);
    }

    const isPasswordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordMatch) {
        throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(user);

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});

const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "You are authenticated",
        user: req.user,
    });
};

module.exports = {
    register,
    login,
    getMe
};