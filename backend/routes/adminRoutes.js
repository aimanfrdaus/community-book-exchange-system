const express = require("express");

const router = express.Router();

const {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    deactivateUser,
    activateUser,
    getAllBooks
} = require("../controllers/adminController");

const {
    deleteBook
} = require("../controllers/bookController");

const {
    verifyToken,
    verifyAdmin
} = require("../middleware/authMiddleware");

router.get(
    "/dashboard/stats",
    verifyToken,
    verifyAdmin,
    getDashboardStats
);

router.get(
    "/users",
    verifyToken,
    verifyAdmin,
    getAllUsers
);

router.put(
    "/users/:user_id/role",
    verifyToken,
    verifyAdmin,
    updateUserRole
);

router.put(
    "/users/:user_id/deactivate",
    verifyToken,
    verifyAdmin,
    deactivateUser
);

router.put(
    "/users/:user_id/activate",
    verifyToken,
    verifyAdmin,
    activateUser
);

router.get(
    "/books",
    verifyToken,
    verifyAdmin,
    getAllBooks
);

router.delete(
    "/books/:book_id",
    verifyToken,
    verifyAdmin,
    deleteBook
);

module.exports = router;