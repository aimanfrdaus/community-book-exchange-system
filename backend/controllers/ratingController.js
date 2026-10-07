const db = require("../config/db");

// Submit a rating for another user
const createRating = async (req, res) => {
    try {
        const reviewerId = req.user.user_id;

        const {
            request_id,
            rating,
            review
        } = req.body;

        // Validate required fields
        if (!request_id || !rating) {
            return res.status(400).json({
                message:
                    "Request ID and rating are required."
            });
        }

        // Validate rating value
        if (
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                message:
                    "Rating must be a whole number between 1 and 5."
            });
        }

        // Get exchange details
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
            `,
            [request_id]
        );

        if (exchangeRows.length === 0) {
            return res.status(404).json({
                message: "Exchange request not found."
            });
        }

        const exchange = exchangeRows[0];

        // Rating is only allowed after completion
        if (exchange.status !== "Completed") {
            return res.status(400).json({
                message:
                    "You can only rate a user after the exchange has been completed."
            });
        }

        // Make sure the reviewer participated in the exchange
        if (
            reviewerId !== exchange.requester_id &&
            reviewerId !== exchange.owner_id
        ) {
            return res.status(403).json({
                message:
                    "You are not a participant in this exchange."
            });
        }

        // Determine the user being rated
        const ratedUserId =
            reviewerId === exchange.requester_id
                ? exchange.owner_id
                : exchange.requester_id;

        // Prevent duplicate rating
        const [existingRatings] = await db.promise().query(
            `
            SELECT rating_id
            FROM ratings
            WHERE request_id = ?
            AND reviewer_id = ?
            `,
            [request_id, reviewerId]
        );

        if (existingRatings.length > 0) {
            return res.status(409).json({
                message:
                    "You have already rated this user for this exchange."
            });
        }

        // Create rating
        const [result] = await db.promise().query(
            `
            INSERT INTO ratings
            (
                request_id,
                reviewer_id,
                rated_user_id,
                rating,
                review
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                request_id,
                reviewerId,
                ratedUserId,
                Number(rating),
                review || null
            ]
        );

        res.status(201).json({
            message: "Rating submitted successfully.",
            rating_id: result.insertId
        });

    } catch (error) {
        console.error("Create rating error:", error);

        res.status(500).json({
            message: "Failed to submit rating."
        });
    }
};


// Get ratings received by a user
const getUserRatings = async (req, res) => {
    try {
        const userId = req.params.userId;

        const [ratings] = await db.promise().query(
            `
            SELECT
                r.rating_id,
                r.request_id,
                r.rating,
                r.review,
                r.created_at,

                u.user_id AS reviewer_id,
                u.name AS reviewer_name

            FROM ratings r

            INNER JOIN users u
                ON r.reviewer_id = u.user_id

            WHERE r.rated_user_id = ?

            ORDER BY r.created_at DESC
            `,
            [userId]
        );

        res.status(200).json(ratings);

    } catch (error) {
        console.error("Get user ratings error:", error);

        res.status(500).json({
            message: "Failed to get user ratings."
        });
    }
};


// Get rating submitted by the current user for a specific exchange
const getMyRatingForExchange = async (req, res) => {
    try {
        const reviewerId = req.user.user_id;
        const requestId = req.params.requestId;

        const [ratings] = await db.promise().query(
            `
            SELECT
                r.rating_id,
                r.request_id,
                r.reviewer_id,
                r.rated_user_id,
                r.rating,
                r.review,
                r.created_at,

                u.name AS rated_user_name

            FROM ratings r

            INNER JOIN users u
                ON r.rated_user_id = u.user_id

            WHERE r.request_id = ?
            AND r.reviewer_id = ?
            `,
            [requestId, reviewerId]
        );

        if (ratings.length === 0) {
            return res.status(200).json({
                rated: false,
                rating: null
            });
        }

        res.status(200).json({
            rated: true,
            rating: ratings[0]
        });

    } catch (error) {
        console.error(
            "Get my rating for exchange error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get rating for this exchange."
        });
    }
};


module.exports = {
    createRating,
    getUserRatings,
    getMyRatingForExchange
};