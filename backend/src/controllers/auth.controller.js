
const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/sendEmail");

// ==========================================
// GENERATE AND SEND EMAIL VERIFICATION OTP
// ==========================================

const createAndSendVerificationOTP = async (user) => {
    // Generate a secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing it in MongoDB
    const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    user.verificationOTP = hashedOTP;

    // OTP expires after 10 minutes
    user.verificationOTPExpires = new Date(
        Date.now() + 10 * 60 * 1000
    );

    await user.save({ validateBeforeSave: false });

    // Email content
    const html = `
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
        ">

            <h2 style="color: #4f46e5;">
                Welcome to Cartiva!
            </h2>

            <p>Hi ${user.name},</p>

            <p>
                Thank you for registering with Cartiva.
                Please verify your email address using the OTP below.
            </p>

            <div style="
                background: #eef2ff;
                padding: 20px;
                text-align: center;
                border-radius: 10px;
                margin: 25px 0;
            ">
                <h1 style="
                    color: #4f46e5;
                    letter-spacing: 10px;
                    margin: 0;
                    font-size: 32px;
                ">
                    ${otp}
                </h1>
            </div>

            <p>
                This OTP is valid for <strong>10 minutes</strong>.
            </p>

            <p>
                Please do not share this OTP with anyone.
            </p>

            <p>
                If you did not create this account,
                you can ignore this email.
            </p>

            <p>
                Thanks,<br />
                <strong>Cartiva Team</strong>
            </p>

        </div>
    `;

    // Send verification email
    await sendEmail({
        to: user.email,
        subject: "Cartiva - Email Verification OTP",
        html,
    });
};


// ==========================================
// REGISTER
// ==========================================

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check whether user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("User already exists", 409);
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        password,
        isEmailVerified: false,
    });

    // Send verification OTP
    // If sending fails, the unverified account remains
    // in the database and can request another OTP.
    await createAndSendVerificationOTP(user);

    res.status(201).json({
        success: true,
        message: "Registration successful. Please check your email for the verification OTP.",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    });
});


// ==========================================
// VERIFY EMAIL OTP
// ==========================================

const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new AppError(
            "Email and OTP are required",
            400
        );
    }

    // Validate 6-digit OTP format
    if (!/^\d{6}$/.test(otp)) {
        throw new AppError(
            "Please enter a valid 6-digit OTP",
            400
        );
    }

    // Find unverified user and retrieve hidden OTP fields
    const user = await User.findOne({
        email,
        isEmailVerified: false,
    }).select(
        "+verificationOTP +verificationOTPExpires"
    );

    if (!user || !user.verificationOTP) {
        throw new AppError(
            "Invalid verification request",
            400
        );
    }

    // Check OTP expiration
    if (
        !user.verificationOTPExpires ||
        user.verificationOTPExpires <= new Date()
    ) {
        throw new AppError(
            "OTP has expired. Please request a new OTP.",
            400
        );
    }

    // Hash the received OTP
    const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    // Compare OTP
    if (hashedOTP !== user.verificationOTP) {
        throw new AppError(
            "Incorrect OTP. Please try again.",
            400
        );
    }

    // Mark email as verified
    user.isEmailVerified = true;

    // Remove OTP after successful verification
    user.verificationOTP = null;
    user.verificationOTPExpires = null;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Email verified successfully. You can now log in.",
    });
});


// ==========================================
// RESEND VERIFICATION OTP
// ==========================================

const resendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError(
            "Email address is required",
            400
        );
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(
            "Unable to process verification request",
            404
        );
    }

    if (user.isEmailVerified) {
        throw new AppError(
            "Email is already verified",
            400
        );
    }

    // Generate and send a new OTP
    await createAndSendVerificationOTP(user);

    res.status(200).json({
        success: true,
        message: "A new verification OTP has been sent to your email.",
    });
});


// ==========================================
// LOGIN
// ==========================================

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User
        .findOne({ email })
        .select("+password");

    if (!user) {
        throw new AppError(
            "Invalid email or password",
            401
        );
    }

    // Check account status
    if (!user.isActive) {
        throw new AppError(
            "Your account is inactive",
            403
        );
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordMatch) {
        throw new AppError(
            "Invalid email or password",
            401
        );
    }

    // Require email verification before login
    if (!user.isEmailVerified) {
        throw new AppError(
            "Please verify your email address before logging in",
            403
        );
    }

    // Generate JWT
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
            isEmailVerified: user.isEmailVerified,
        },
    });
});


// ==========================================
// GET CURRENT USER
// ==========================================

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);

    if (!user || !user.isActive) {
        throw new AppError(
            "User not found or inactive",
            401
        );
    }

    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    });
});


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    register,
    login,
    getMe,
    verifyEmail,
    resendVerificationEmail,
};
