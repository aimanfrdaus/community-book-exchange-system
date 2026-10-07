const db = require("../config/db");

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [notifications] = await db.promise().query(
            `
            SELECT
                notification_id,
                user_id,
                request_id,
                type,
                title,
                message,
                is_read,
                created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            `,
            [userId]
        );

        res.status(200).json(notifications);

    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            message: "Failed to get notifications."
        });
    }
};


// Get unread notification count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [result] = await db.promise().query(
            `
            SELECT COUNT(*) AS unread_count
            FROM notifications
            WHERE user_id = ?
            AND is_read = FALSE
            `,
            [userId]
        );

        res.status(200).json({
            unread_count: result[0].unread_count
        });

    } catch (error) {
        console.error("Get unread count error:", error);

        res.status(500).json({
            message: "Failed to get unread notification count."
        });
    }
};


// Mark one notification as read
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const notificationId = req.params.id;

        const [result] = await db.promise().query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = ?
            AND user_id = ?
            `,
            [notificationId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Notification not found."
            });
        }

        res.status(200).json({
            message: "Notification marked as read."
        });

    } catch (error) {
        console.error("Mark notification as read error:", error);

        res.status(500).json({
            message: "Failed to mark notification as read."
        });
    }
};


// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;

        await db.promise().query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = ?
            AND is_read = FALSE
            `,
            [userId]
        );

        res.status(200).json({
            message: "All notifications marked as read."
        });

    } catch (error) {
        console.error("Mark all notifications as read error:", error);

        res.status(500).json({
            message: "Failed to mark all notifications as read."
        });
    }
};


// Create a notification
// This function will be used later by the exchange controller
const createNotification = async (
    userId,
    requestId,
    type,
    title,
    message
) => {
    try {
        await db.promise().query(
            `
            INSERT INTO notifications
            (
                user_id,
                request_id,
                type,
                title,
                message
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                userId,
                requestId,
                type,
                title,
                message
            ]
        );

    } catch (error) {
        console.error("Create notification error:", error);

        throw error;
    }
};


module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification
};