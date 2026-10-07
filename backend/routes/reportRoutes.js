const express = require("express");

const router = express.Router();

const {
    createReport,
    getAllReports,
    updateReportStatus
} = require("../controllers/reportController");

const {
    verifyToken,
    verifyAdmin
} = require("../middleware/authMiddleware");


// User submits a report
router.post("/", createReport);


// Admin retrieves all reports
router.get(
    "/admin",
    verifyToken,
    verifyAdmin,
    getAllReports
);

router.put(
    "/admin/:report_id/status",
    verifyToken,
    verifyAdmin,
    updateReportStatus
);


module.exports = router;