const db = require("../config/db");


// ==========================================
// CREATE REPORT
// ==========================================

const createReport = (req, res) => {
    const {
        reporter_id,
        reported_user_id,
        book_id,
        reason,
        description
    } = req.body;

    if (
        !reporter_id ||
        !reported_user_id ||
        !book_id ||
        !reason
    ) {
        return res.status(400).json({
            message:
                "Reporter, reported user, book and reason are required."
        });
    }

    const sql = `
        INSERT INTO reports (
            reporter_id,
            reported_user_id,
            book_id,
            reason,
            description
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            reporter_id,
            reported_user_id,
            book_id,
            reason,
            description || null
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Create report error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to submit report."
                });
            }

            res.status(201).json({
                message:
                    "Report submitted successfully.",
                report_id: result.insertId
            });
        }
    );
};


// ==========================================
// GET ALL REPORTS
// ADMIN ONLY
// ==========================================

const getAllReports = (req, res) => {

    const sql = `
        SELECT
            r.report_id,

            r.reporter_id,
            reporter.name AS reporter_name,

            r.reported_user_id,
            reported.name AS reported_user_name,

            r.book_id,
            b.title AS book_title,

            r.reason,
            r.description,
            r.status,
            r.created_at

        FROM reports r

        LEFT JOIN users reporter
            ON r.reporter_id = reporter.user_id

        LEFT JOIN users reported
            ON r.reported_user_id = reported.user_id

        LEFT JOIN books b
            ON r.book_id = b.book_id

        ORDER BY r.created_at DESC
    `;

    db.query(
        sql,
        (err, results) => {

            if (err) {
                console.error(
                    "Get reports error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to retrieve reports."
                });
            }

            res.status(200).json({
                reports: results
            });
        }
    );
};

const updateReportStatus = (req, res) => {

    const { report_id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
        "Pending",
        "Reviewed",
        "Resolved",
        "Rejected"
    ];

    if (!report_id) {
        return res.status(400).json({
            message: "Report ID is required."
        });
    }

    if (!status) {
        return res.status(400).json({
            message: "Report status is required."
        });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid report status."
        });
    }

    const sql = `
        UPDATE reports
        SET status = ?
        WHERE report_id = ?
    `;

    db.query(
        sql,
        [status, report_id],
        (err, result) => {

            if (err) {
                console.error(
                    "Update report status error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to update report status."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message:
                        "Report not found."
                });
            }

            res.status(200).json({
                message:
                    "Report status updated successfully."
            });
        }
    );
};


module.exports = {
    createReport,
    getAllReports,
    updateReportStatus
};