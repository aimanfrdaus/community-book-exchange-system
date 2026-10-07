const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const googleClient = require("../config/googleClient");
const crypto = require("crypto");
const transporter = require("../config/mailer");

const register = async (req, res) => {
    try {
        const { name, email, password, location } = req.body;

        // 1. Check required fields
        if (!name || !email || !password || !location) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        // 2. Check if email already exists
        const [existingUsers] = await db.promise().query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Insert user into database
        const [result] = await db.promise().query(
            `INSERT INTO users 
            (name, email, password, location)
            VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, location]
        );

        // 5. Send success response
        res.status(201).json({
            message: "Registration successful.",
            user: {
                user_id: result.insertId,
                name,
                email,
                location,
                role: "user"
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error during registration."
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // 2. Find user by email
        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

if (user.status === "inactive") {
    return res.status(403).json({
        message: "Your account has been deactivated."
    });
}        

        // 3. Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // 4. Create JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // 5. Send response
        res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                location: user.location,
                profile_image: user.profile_image
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login."
        });
    }
};


const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required."
            });
        }

        // Verify Google credential
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name;
        const profileImage = payload.picture;

        if (!googleId || !email) {
            return res.status(400).json({
                message: "Unable to retrieve Google account information."
            });
        }

        // Check if Google account already exists
        const [googleUsers] = await db.promise().query(
            "SELECT * FROM users WHERE google_id = ?",
            [googleId]
        );

        let user;

        if (googleUsers.length > 0) {
            user = googleUsers[0];

        } else {
            // Check if email already exists
            const [emailUsers] = await db.promise().query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );

            if (emailUsers.length > 0) {
                return res.status(409).json({
                    message:
                        "An account with this email already exists. Please log in using your email and password."
                });
            }

            // Create new Google account
            const [result] = await db.promise().query(
                `INSERT INTO users
                (name, email, password, location, google_id, profile_image)
                VALUES (?, ?, NULL, NULL, ?, ?)`,
                [
                    name,
                    email,
                    googleId,
                    profileImage || null
                ]
            );

            const [newUsers] = await db.promise().query(
                "SELECT * FROM users WHERE user_id = ?",
                [result.insertId]
            );

            user = newUsers[0];
        }

        // Check account status
        if (user.status === "inactive") {
            return res.status(403).json({
                message: "Your account has been deactivated."
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Google login successful.",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                location: user.location,
                profile_image: user.profile_image
            }
        });

    } catch (error) {
        console.error("Google login error:", error);

        res.status(500).json({
            message: "Server error during Google authentication."
        });
    }
};


const getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [users] = await db.promise().query(
            `SELECT user_id, name, email, location, role, status, profile_image
             FROM users
             WHERE user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.status(200).json({
            user: users[0]
        });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            message: "Server error while retrieving profile."
        });
    }
};


const updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const { name, location } = req.body;

        // Check required fields
        if (!name || !location) {
            return res.status(400).json({
                message: "Name and location are required."
            });
        }

        // Update profile
        await db.promise().query(
            `UPDATE users
             SET name = ?, location = ?
             WHERE user_id = ?`,
            [name, location, userId]
        );

        // Get updated user
        const [users] = await db.promise().query(
            `SELECT user_id, name, email, location, role, status, profile_image
             FROM users
             WHERE user_id = ?`,
            [userId]
        );

        res.status(200).json({
            message: "Profile updated successfully.",
            user: users[0]
        });

    } catch (error) {
        console.error("Update profile error:", error);

        res.status(500).json({
            message: "Server error while updating profile."
        });
    }
};

const updateProfileImage = async (req, res) => {
    try {
        const userId = req.user.user_id;

        if (!req.file) {
            return res.status(400).json({
                message: "Please select a profile image."
            });
        }

        const profileImage = req.file.filename;

        await db.promise().query(
            `UPDATE users
             SET profile_image = ?
             WHERE user_id = ?`,
            [profileImage, userId]
        );

        const [users] = await db.promise().query(
            `SELECT
                user_id,
                name,
                email,
                location,
                role,
                status,
                profile_image
             FROM users
             WHERE user_id = ?`,
            [userId]
        );

        res.status(200).json({
            message: "Profile image updated successfully.",
            user: users[0]
        });

    } catch (error) {
        console.error(
            "Update profile image error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while updating profile image."
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required."
            });
        }

        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "No account found with this email."
            });
        }

        const user = users[0];

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Token expires after 1 hour
        const resetTokenExpiry = new Date(
            Date.now() + 60 * 60 * 1000
        );

        await db.promise().query(
            `UPDATE users
             SET reset_token = ?, reset_token_expiry = ?
             WHERE user_id = ?`,
            [
                resetToken,
                resetTokenExpiry,
                user.user_id
            ]
        );

        const resetLink =
            `http://localhost:5173/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: `"Community Book Exchange" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Reset Your Community Book Exchange Password",

            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">

                    <h2>Password Reset Request</h2>

                    <p>Hello ${user.name},</p>

                    <p>
                        We received a request to reset your
                        Community Book Exchange account password.
                    </p>

                    <p>
                        Click the button below to create a new password:
                    </p>

                    <p>
                        <a
                            href="${resetLink}"
                            style="
                                display: inline-block;
                                padding: 12px 20px;
                                background-color: #2563eb;
                                color: white;
                                text-decoration: none;
                                border-radius: 6px;
                            "
                        >
                            Reset Password
                        </a>
                    </p>

                    <p>
                        This link will expire in 1 hour.
                    </p>

                    <p>
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </p>

                    <p>
                        Community Book Exchange
                    </p>

                </div>
            `
        });

        res.status(200).json({
            message:
                "Password reset instructions have been sent to your email."
        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while processing password reset."
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Reset token is required."
            });
        }

        if (!password) {
            return res.status(400).json({
                message: "New password is required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters long."
            });
        }

        const [users] = await db.promise().query(
            `SELECT *
             FROM users
             WHERE reset_token = ?
             AND reset_token_expiry > NOW()`,
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({
                message:
                    "Invalid or expired password reset link."
            });
        }

        const user = users[0];

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        await db.promise().query(
            `UPDATE users
             SET password = ?,
                 reset_token = NULL,
                 reset_token_expiry = NULL
             WHERE user_id = ?`,
            [
                hashedPassword,
                user.user_id
            ]
        );

        res.status(200).json({
            message:
                "Password reset successfully. You can now log in."
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while resetting password."
        });
    }
};

const validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                message: "Reset token is required."
            });
        }

        const [users] = await db.promise().query(
            `SELECT user_id
             FROM users
             WHERE reset_token = ?
             AND reset_token_expiry > NOW()`,
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({
                message: "Invalid or expired password reset link."
            });
        }

        res.status(200).json({
            message: "Reset token is valid."
        });

    } catch (error) {
        console.error(
            "Validate reset token error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while validating reset token."
        });
    }
};

module.exports = {
    register,
    login,
    googleLogin,
    getProfile,
    updateProfile,
    updateProfileImage,
    forgotPassword,
    resetPassword,
    validateResetToken
};