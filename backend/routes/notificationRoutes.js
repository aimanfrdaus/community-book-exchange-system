const express = require("express");

const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require("../controllers/notificationController");

const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();


// Get current user's notifications
router.get("/", verifyToken, getNotifications);


// Get unread notification count
router.get("/unread-count", verifyToken, getUnreadCount);


// Mark all notifications as read
router.put("/read-all", verifyToken, markAllAsRead);


// Mark one notification as read
router.put("/:id/read", verifyToken, markAsRead);


module.exports = router;