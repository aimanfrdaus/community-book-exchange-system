const db = require("../config/db");

const {
    createNotification
} = require("./notificationController");

// Get meetup details for an exchange request
const getMeetup = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const userId = req.user.user_id;

        const [rows] = await db.promise().query(
            `
            SELECT
                m.meetup_id,
                m.request_id,
                m.meetup_date,
                m.meetup_time,
                m.location,
                m.notes,
                m.created_at,
                m.updated_at
            FROM meetups m
            INNER JOIN exchange_requests er
                ON m.request_id = er.request_id
            WHERE m.request_id = ?
            AND (er.requester_id = ? OR er.owner_id = ?)
            `,
            [requestId, userId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Meetup details not found."
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Get meetup error:", error);

        res.status(500).json({
            message: "Failed to get meetup details."
        });
    }
};


// Create meetup details
const createMeetup = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const userId = req.user.user_id;

        const {
            meetup_date,
            meetup_time,
            location,
            notes
        } = req.body;

        if (
            !meetup_date ||
            !meetup_time ||
            !location
        ) {
            return res.status(400).json({
                message:
                    "Meetup date, time and location are required."
            });
        }

        // Check that the exchange exists and belongs to the user
const [exchangeRows] = await db.promise().query(
    `
    SELECT
        er.request_id,
        er.requester_id,
        er.owner_id,
        er.status,
        b.title
    FROM exchange_requests er
    INNER JOIN books b
        ON er.book_id = b.book_id
    WHERE er.request_id = ?
    AND (er.requester_id = ? OR er.owner_id = ?)
    `,
    [requestId, userId, userId]
);

        if (exchangeRows.length === 0) {
            return res.status(404).json({
                message: "Exchange request not found."
            });
        }

        const exchange = exchangeRows[0];

        if (exchange.status !== "Accepted") {
            return res.status(400).json({
                message:
                    "Meetup can only be arranged for an accepted exchange."
            });
        }

        // Check if meetup already exists
        const [existingMeetup] = await db.promise().query(
            `
            SELECT meetup_id
            FROM meetups
            WHERE request_id = ?
            `,
            [requestId]
        );

        if (existingMeetup.length > 0) {
            return res.status(409).json({
                message:
                    "Meetup details already exist for this exchange."
            });
        }

        const [result] = await db.promise().query(
            `
            INSERT INTO meetups
            (
                request_id,
                meetup_date,
                meetup_time,
                location,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                requestId,
                meetup_date,
                meetup_time,
                location,
                notes || null
            ]
        );

// Notify the other person about the new meetup
const otherUserId =
    exchange.requester_id === userId
        ? exchange.owner_id
        : exchange.requester_id;

await createNotification(
    otherUserId,
    requestId,
    "Meetup Arranged",
    "Meetup Arranged",
    `A meetup has been arranged for your exchange of "${exchange.title}". Please check the meetup details.`
);

res.status(201).json({
    message: "Meetup details created successfully.",
    meetup_id: result.insertId
});

    } catch (error) {
        console.error("Create meetup error:", error);

        res.status(500).json({
            message: "Failed to create meetup details."
        });
    }
};


// Update meetup details
const updateMeetup = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const userId = req.user.user_id;

        const {
            meetup_date,
            meetup_time,
            location,
            notes
        } = req.body;

        if (
            !meetup_date ||
            !meetup_time ||
            !location
        ) {
            return res.status(400).json({
                message:
                    "Meetup date, time and location are required."
            });
        }

const [exchangeRows] = await db.promise().query(
    `
    SELECT
        er.request_id,
        er.requester_id,
        er.owner_id,
        er.status,
        b.title
    FROM exchange_requests er
    INNER JOIN books b
        ON er.book_id = b.book_id
    WHERE er.request_id = ?
    AND (er.requester_id = ? OR er.owner_id = ?)
    `,
    [requestId, userId, userId]
);

        if (exchangeRows.length === 0) {
            return res.status(404).json({
                message: "Exchange request not found."
            });
        }

        if (exchangeRows[0].status !== "Accepted") {
            return res.status(400).json({
                message:
                    "Meetup can only be updated for an accepted exchange."
            });
        }

        const [result] = await db.promise().query(
            `
            UPDATE meetups
            SET
                meetup_date = ?,
                meetup_time = ?,
                location = ?,
                notes = ?
            WHERE request_id = ?
            `,
            [
                meetup_date,
                meetup_time,
                location,
                notes || null,
                requestId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Meetup details not found."
            });
        }

        // Notify the other person about the updated meetup
const exchange = exchangeRows[0];

const otherUserId =
    exchange.requester_id === userId
        ? exchange.owner_id
        : exchange.requester_id;

await createNotification(
    otherUserId,
    requestId,
    "Meetup Updated",
    "Meetup Updated",
    `The meetup details for your exchange of "${exchange.title}" have been updated. Please check the latest arrangement.`
);

        res.status(200).json({
            message: "Meetup details updated successfully."
        });

    } catch (error) {
        console.error("Update meetup error:", error);

        res.status(500).json({
            message: "Failed to update meetup details."
        });
    }
};


module.exports = {
    getMeetup,
    createMeetup,
    updateMeetup
};