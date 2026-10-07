const db = require("../config/db");

const getDashboardStats = (req, res) => {

    const sql = `
        SELECT

            (SELECT COUNT(*)
             FROM users) AS totalUsers,

            (SELECT COUNT(*)
             FROM books) AS totalBooks,

            (SELECT COUNT(*)
             FROM exchange_requests
             WHERE status = 'Pending') AS pendingExchanges,

            (SELECT COUNT(*)
             FROM exchange_requests
             WHERE status = 'Completed') AS completedExchanges
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(
                "Admin dashboard error:",
                err
            );

            return res.status(500).json({
                message:
                    "Failed to retrieve dashboard statistics"
            });
        }

        res.status(200).json({
            message: "Dashboard statistics retrieved successfully",
            stats: results[0]
        });
    });
};



const getAllUsers = (req, res) => {
    const sql = `
        SELECT 
    user_id,
    name,
    email,
    location,
    profile_image,
    role,
    status
FROM users
        ORDER BY user_id ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get all users error:", err);

            return res.status(500).json({
                message: "Failed to retrieve users"
            });
        }

        res.status(200).json({
            message: "Users retrieved successfully",
            users: results
        });
    });
};

const updateUserRole = (req, res) => {
    const { user_id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
        return res.status(400).json({
            message: "Invalid role"
        });
    }

    // Prevent admin from changing their own role
    if (Number(req.user.user_id) === Number(user_id)) {
        return res.status(400).json({
            message: "You cannot change your own role"
        });
    }

    const sql = `
        UPDATE users
        SET role = ?
        WHERE user_id = ?
    `;

    db.query(sql, [role, user_id], (err, result) => {
        if (err) {
            console.error("Update user role error:", err);

            return res.status(500).json({
                message: "Failed to update user role"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User role updated successfully"
        });
    });
};

const deactivateUser = (req, res) => {
    const { user_id } = req.params;

    // Prevent admin from deactivating their own account
    if (Number(req.user.user_id) === Number(user_id)) {
        return res.status(400).json({
            message: "You cannot deactivate your own account"
        });
    }

    const sql = `
        UPDATE users
        SET status = 'inactive'
        WHERE user_id = ?
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("Deactivate user error:", err);

            return res.status(500).json({
                message: "Failed to deactivate user"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deactivated successfully"
        });
    });
};

const activateUser = (req, res) => {
    const { user_id } = req.params;

    // Prevent admin from activating their own account
    if (Number(req.user.user_id) === Number(user_id)) {
        return res.status(400).json({
            message: "You cannot change your own account status"
        });
    }

    const sql = `
        UPDATE users
        SET status = 'active'
        WHERE user_id = ?
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("Activate user error:", err);

            return res.status(500).json({
                message: "Failed to activate user"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User activated successfully"
        });
    });
};

const getAllBooks = (req, res) => {
    const sql = `
        SELECT
            b.book_id,
            b.title,
            b.author,
            b.genre,
            b.condition_status,
            b.cover_image,
            b.description,
            b.location,
            b.status,
            b.created_at,
            u.user_id,
            u.name AS owner_name,
            u.email AS owner_email
        FROM books b
        JOIN users u ON b.user_id = u.user_id
        ORDER BY b.book_id ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get all books error:", err);

            return res.status(500).json({
                message: "Failed to retrieve books"
            });
        }

        res.status(200).json({
            message: "Books retrieved successfully",
            books: results
        });
    });
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    deactivateUser,
    activateUser,
    getAllBooks
};