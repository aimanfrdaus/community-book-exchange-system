const express = require("express");

const {
    register,
    login,
    googleLogin,
    forgotPassword,
    resetPassword,
    validateResetToken,
    getProfile,
    updateProfile,
    updateProfileImage
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

router.post("/register", register);

router.post("/login", login);
router.post("/google", googleLogin);

// Profile
router.get("/profile", verifyToken, getProfile);

router.put("/profile", verifyToken, updateProfile);

router.post("/forgot-password", forgotPassword);

router.post(
    "/reset-password/:token",
    resetPassword
);

router.get(
    "/validate-reset-token/:token",
    validateResetToken
);

router.put(
    "/profile/image",
    verifyToken,
    upload.single("profile_image"),
    updateProfileImage
);

module.exports = router;