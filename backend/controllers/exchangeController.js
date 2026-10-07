const db = require("../config/db");

const {
    createNotification
} = require("./notificationController");


// ======================================================
// CREATE EXCHANGE REQUEST
// ======================================================

const createExchangeRequest = (req, res) => {
    const { book_id, requester_id } = req.body;

    if (!book_id || !requester_id) {
        return res.status(400).json({
            message: "Book ID and requester ID are required"
        });
    }

    // First, find the book owner
    const getBookSql = `
        SELECT book_id, user_id, status, title
        FROM books
        WHERE book_id = ?
    `;

    db.query(getBookSql, [book_id], (err, results) => {

        if (err) {
            console.error("Get book error:", err);

            return res.status(500).json({
                message: "Failed to retrieve book"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const book = results[0];

        // Prevent requesting unavailable books
        if (book.status !== "Available") {
            return res.status(400).json({
                message: "This book is not available"
            });
        }

        // Prevent requesting your own book
        if (book.user_id === requester_id) {
            return res.status(400).json({
                message: "You cannot request your own book"
            });
        }

        // Check whether the user already requested this book
        const checkSql = `
            SELECT request_id
            FROM exchange_requests
            WHERE book_id = ?
            AND requester_id = ?
            AND status = 'Pending'
        `;

        db.query(
            checkSql,
            [book_id, requester_id],
            (err, existingRequests) => {

                if (err) {
                    console.error(
                        "Check request error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to check existing request"
                    });
                }

                if (existingRequests.length > 0) {
                    return res.status(400).json({
                        message:
                            "You already have a pending request for this book"
                    });
                }

                // Create exchange request
                const insertSql = `
                    INSERT INTO exchange_requests
                    (book_id, requester_id, owner_id)
                    VALUES (?, ?, ?)
                `;

                db.query(
                    insertSql,
                    [
                        book_id,
                        requester_id,
                        book.user_id
                    ],
                    async (err, result) => {

                        if (err) {
                            console.error(
                                "Create request error:",
                                err
                            );

                            return res.status(500).json({
                                message:
                                    "Failed to create exchange request"
                            });
                        }

                        const requestId = result.insertId;

                        // Create notification for book owner
                        try {

                            await createNotification(
                                book.user_id,
                                requestId,
                                "New Request",
                                "New Exchange Request",
                                `Someone has requested your book "${book.title}".`
                            );

                        } catch (notificationError) {

                            console.error(
                                "Notification error:",
                                notificationError
                            );

                            // The exchange request was already
                            // successfully created, so don't fail
                            // the request because of notification.
                        }

                        res.status(201).json({
                            message:
                                "Exchange request created successfully",
                            request_id: requestId
                        });
                    }
                );
            }
        );
    });
};


// ======================================================
// GET MY REQUESTS
// ======================================================

const getMyRequests = (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT
            exchange_requests.request_id,
            exchange_requests.book_id,
            exchange_requests.requester_id,
            exchange_requests.owner_id,
            exchange_requests.status,
            exchange_requests.request_date,

            books.title,
            books.author,
            books.cover_image,
            books.location,

            users.name AS owner_name

        FROM exchange_requests

        INNER JOIN books
            ON exchange_requests.book_id = books.book_id

        INNER JOIN users
            ON exchange_requests.owner_id = users.user_id

        WHERE exchange_requests.requester_id = ?

        ORDER BY exchange_requests.request_date DESC
    `;

    db.query(sql, [user_id], (err, results) => {

        if (err) {
            console.error(
                "Get my requests error:",
                err
            );

            return res.status(500).json({
                message:
                    "Failed to retrieve exchange requests"
            });
        }

        res.status(200).json({
            requests: results
        });
    });
};


// ======================================================
// GET INCOMING REQUESTS
// ======================================================

const getIncomingRequests = (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT
            exchange_requests.request_id,
            exchange_requests.book_id,
            exchange_requests.requester_id,
            exchange_requests.owner_id,
            exchange_requests.status,
            exchange_requests.request_date,

            books.title,
            books.author,
            books.cover_image,

            users.name AS requester_name,
            users.email AS requester_email

        FROM exchange_requests

        INNER JOIN books
            ON exchange_requests.book_id = books.book_id

        INNER JOIN users
            ON exchange_requests.requester_id = users.user_id

        WHERE exchange_requests.owner_id = ?

        ORDER BY exchange_requests.request_date DESC
    `;

    db.query(sql, [user_id], (err, results) => {

        if (err) {
            console.error(
                "Get incoming requests error:",
                err
            );

            return res.status(500).json({
                message:
                    "Failed to retrieve incoming requests"
            });
        }

        res.status(200).json({
            requests: results
        });
    });
};


// ======================================================
// ACCEPT / REJECT EXCHANGE REQUEST
// ======================================================

const updateExchangeRequest = (req, res) => {

    const { request_id } = req.params;
    const { status, owner_id } = req.body;

    if (!status || !owner_id) {
        return res.status(400).json({
            message: "Status and owner ID are required"
        });
    }

    if (
        status !== "Accepted" &&
        status !== "Rejected"
    ) {
        return res.status(400).json({
            message: "Invalid status"
        });
    }

    // Start a database transaction
    db.getConnection(
        (connectionError, connection) => {

            if (connectionError) {

                console.error(
                    "Database connection error:",
                    connectionError
                );

                return res.status(500).json({
                    message:
                        "Database connection failed"
                });
            }

            connection.beginTransaction(
                (transactionError) => {

                    if (transactionError) {

                        connection.release();

                        return res.status(500).json({
                            message:
                                "Failed to start transaction"
                        });
                    }

                    // Lock the exchange request row
                    const requestSql = `
                        SELECT
                            request_id,
                            book_id,
                            requester_id,
                            owner_id,
                            status
                        FROM exchange_requests
                        WHERE request_id = ?
                        AND owner_id = ?
                        FOR UPDATE
                    `;

                    connection.query(
                        requestSql,
                        [request_id, owner_id],
                        (err, results) => {

                            if (err) {

                                return connection.rollback(
                                    () => {

                                        connection.release();

                                        console.error(
                                            "Check request error:",
                                            err
                                        );

                                        res.status(500).json({
                                            message:
                                                "Failed to check exchange request"
                                        });
                                    }
                                );
                            }

                            if (results.length === 0) {

                                return connection.rollback(
                                    () => {

                                        connection.release();

                                        res.status(404).json({
                                            message:
                                                "Exchange request not found"
                                        });
                                    }
                                );
                            }

                            const request = results[0];

                            // Request must still be pending
                            if (request.status !== "Pending") {

                                return connection.rollback(
                                    () => {

                                        connection.release();

                                        res.status(400).json({
                                            message:
                                                "This exchange request has already been processed"
                                        });
                                    }
                                );
                            }


                            // ==========================================
                            // REJECT REQUEST
                            // ==========================================

                            if (status === "Rejected") {

                                const rejectSql = `
                                    UPDATE exchange_requests
                                    SET status = 'Rejected'
                                    WHERE request_id = ?
                                `;

                                connection.query(
                                    rejectSql,
                                    [request_id],
                                    async (err) => {

                                        if (err) {

                                            return connection.rollback(
                                                () => {

                                                    connection.release();

                                                    console.error(
                                                        "Reject request error:",
                                                        err
                                                    );

                                                    res.status(500).json({
                                                        message:
                                                            "Failed to reject exchange request"
                                                    });
                                                }
                                            );
                                        }

                                        connection.commit(
                                            async (commitError) => {

                                                if (commitError) {

                                                    return connection.rollback(
                                                        () => {

                                                            connection.release();

                                                            res.status(500).json({
                                                                message:
                                                                    "Failed to complete rejection"
                                                            });
                                                        }
                                                    );
                                                }

                                                connection.release();

                                                // Notify requester
                                                try {

                                                    await createNotification(
                                                        request.requester_id,
                                                        request.request_id,
                                                        "Request Rejected",
                                                        "Exchange Request Rejected",
                                                        "Your exchange request has been rejected by the book owner."
                                                    );

                                                } catch (
                                                    notificationError
                                                ) {

                                                    console.error(
                                                        "Notification error:",
                                                        notificationError
                                                    );
                                                }

                                                res.status(200).json({
                                                    message:
                                                        "Exchange request rejected successfully"
                                                });
                                            }
                                        );
                                    }
                                );

                                return;
                            }


                            // ==========================================
                            // ACCEPT REQUEST
                            // ==========================================

                            // Lock the book row
                            const bookSql = `
                                SELECT
                                    book_id,
                                    status
                                FROM books
                                WHERE book_id = ?
                                FOR UPDATE
                            `;

                            connection.query(
                                bookSql,
                                [request.book_id],
                                (err, bookResults) => {

                                    if (err) {

                                        return connection.rollback(
                                            () => {

                                                connection.release();

                                                console.error(
                                                    "Check book error:",
                                                    err
                                                );

                                                res.status(500).json({
                                                    message:
                                                        "Failed to check book"
                                                });
                                            }
                                        );
                                    }

                                    if (bookResults.length === 0) {

                                        return connection.rollback(
                                            () => {

                                                connection.release();

                                                res.status(404).json({
                                                    message:
                                                        "Book not found"
                                                });
                                            }
                                        );
                                    }

                                    const book = bookResults[0];

                                    // Book already accepted by someone else
                                    if (book.status !== "Available") {

                                        return connection.rollback(
                                            () => {

                                                connection.release();

                                                res.status(400).json({
                                                    message:
                                                        "This book is no longer available for exchange"
                                                });
                                            }
                                        );
                                    }


                                    // Accept selected request
                                    const acceptSql = `
                                        UPDATE exchange_requests
                                        SET status = 'Accepted'
                                        WHERE request_id = ?
                                    `;

                                    connection.query(
                                        acceptSql,
                                        [request_id],
                                        (err) => {

                                            if (err) {

                                                return connection.rollback(
                                                    () => {

                                                        connection.release();

                                                        console.error(
                                                            "Accept request error:",
                                                            err
                                                        );

                                                        res.status(500).json({
                                                            message:
                                                                "Failed to accept exchange request"
                                                        });
                                                    }
                                                );
                                            }


                                            // Make book unavailable
                                            const unavailableSql = `
                                                UPDATE books
                                                SET status = 'Unavailable'
                                                WHERE book_id = ?
                                            `;

                                            connection.query(
                                                unavailableSql,
                                                [request.book_id],
                                                (err) => {

                                                    if (err) {

                                                        return connection.rollback(
                                                            () => {

                                                                connection.release();

                                                                console.error(
                                                                    "Update book status error:",
                                                                    err
                                                                );

                                                                res.status(500).json({
                                                                    message:
                                                                        "Failed to update book status"
                                                                });
                                                            }
                                                        );
                                                    }


                                                    // Reject all other pending
                                                    // requests for this book
                                                    const rejectOthersSql = `
                                                        UPDATE exchange_requests
                                                        SET status = 'Rejected'
                                                        WHERE book_id = ?
                                                        AND request_id != ?
                                                        AND status = 'Pending'
                                                    `;

                                                    connection.query(
                                                        rejectOthersSql,
                                                        [
                                                            request.book_id,
                                                            request_id
                                                        ],
                                                        async (
                                                            err,
                                                            rejectResult
                                                        ) => {

                                                            if (err) {

                                                                return connection.rollback(
                                                                    () => {

                                                                        connection.release();

                                                                        console.error(
                                                                            "Reject other requests error:",
                                                                            err
                                                                        );

                                                                        res.status(500).json({
                                                                            message:
                                                                                "Failed to reject other requests"
                                                                        });
                                                                    }
                                                                );
                                                            }


                                                            // Everything succeeded
                                                            connection.commit(
                                                                async (
                                                                    commitError
                                                                ) => {

                                                                    if (
                                                                        commitError
                                                                    ) {

                                                                        return connection.rollback(
                                                                            () => {

                                                                                connection.release();

                                                                                res.status(500).json({
                                                                                    message:
                                                                                        "Failed to complete exchange acceptance"
                                                                                });
                                                                            }
                                                                        );
                                                                    }

                                                                    connection.release();


                                                                    // ==========================================
                                                                    // CREATE NOTIFICATIONS
                                                                    // ==========================================

                                                                    // Notify the requester whose
                                                                    // request was accepted
                                                                    try {

                                                                        await createNotification(
                                                                            request.requester_id,
                                                                            request.request_id,
                                                                            "Request Accepted",
                                                                            "Exchange Request Accepted",
                                                                            "Your exchange request has been accepted by the book owner."
                                                                        );

                                                                    } catch (
                                                                        notificationError
                                                                    ) {

                                                                        console.error(
                                                                            "Accepted notification error:",
                                                                            notificationError
                                                                        );
                                                                    }


                                                                    // Notify requesters whose
                                                                    // requests were automatically rejected
                                                                    if (
                                                                        rejectResult.affectedRows >
                                                                        0
                                                                    ) {

                                                                        const rejectedSql = `
                                                                            SELECT
                                                                                request_id,
                                                                                requester_id
                                                                            FROM exchange_requests
                                                                            WHERE book_id = ?
                                                                            AND request_id != ?
                                                                            AND status = 'Rejected'
                                                                            AND requester_id != ?
                                                                        `;

                                                                        db.query(
                                                                            rejectedSql,
                                                                            [
                                                                                request.book_id,
                                                                                request_id,
                                                                                request.requester_id
                                                                            ],
                                                                            async (
                                                                                rejectedErr,
                                                                                rejectedRequests
                                                                            ) => {

                                                                                if (
                                                                                    rejectedErr
                                                                                ) {

                                                                                    console.error(
                                                                                        "Get rejected requests error:",
                                                                                        rejectedErr
                                                                                    );

                                                                                } else {

                                                                                    for (
                                                                                        const rejectedRequest of rejectedRequests
                                                                                    ) {

                                                                                        try {

                                                                                            await createNotification(
                                                                                                rejectedRequest.requester_id,
                                                                                                rejectedRequest.request_id,
                                                                                                "Request Rejected",
                                                                                                "Exchange Request Rejected",
                                                                                                "Your exchange request was rejected because the book was accepted by another requester."
                                                                                            );

                                                                                        } catch (
                                                                                            notificationError
                                                                                        ) {

                                                                                            console.error(
                                                                                                "Rejected notification error:",
                                                                                                notificationError
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                }

                                                                                res.status(200).json({
                                                                                    message:
                                                                                        "Exchange request accepted successfully"
                                                                                });
                                                                            }
                                                                        );

                                                                        return;
                                                                    }


                                                                    res.status(200).json({
                                                                        message:
                                                                            "Exchange request accepted successfully"
                                                                    });
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// COMPLETE EXCHANGE
// ======================================================

const completeExchange = (req, res) => {

    const { request_id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({
            message: "User ID is required"
        });
    }

    const checkSql = `
        SELECT
            request_id,
            book_id,
            requester_id,
            owner_id,
            status
        FROM exchange_requests
        WHERE request_id = ?
        AND (requester_id = ? OR owner_id = ?)
    `;

    db.query(
        checkSql,
        [request_id, user_id, user_id],
        (err, results) => {

            if (err) {

                console.error(
                    "Check exchange error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to check exchange"
                });
            }

            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "Exchange request not found"
                });
            }

            const exchange = results[0];

            if (exchange.status !== "Accepted") {

                return res.status(400).json({
                    message:
                        "Only accepted exchanges can be completed"
                });
            }


            const updateSql = `
                UPDATE exchange_requests
                SET status = 'Completed'
                WHERE request_id = ?
            `;

            db.query(
                updateSql,
                [request_id],
                async (err) => {

                    if (err) {

                        console.error(
                            "Complete exchange error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to complete exchange"
                        });
                    }


                    // ==========================================
                    // CREATE COMPLETION NOTIFICATIONS
                    // ==========================================

                    try {

                        await createNotification(
                            exchange.requester_id,
                            exchange.request_id,
                            "Exchange Completed",
                            "Exchange Completed",
                            "Your book exchange has been marked as completed."
                        );

                        await createNotification(
                            exchange.owner_id,
                            exchange.request_id,
                            "Exchange Completed",
                            "Exchange Completed",
                            "Your book exchange has been marked as completed."
                        );

                    } catch (notificationError) {

                        console.error(
                            "Completion notification error:",
                            notificationError
                        );
                    }


                    return res.status(200).json({
                        message:
                            "Exchange completed successfully"
                    });
                }
            );
        }
    );
};

                    // ======================================================
                    // GET EXCHANGE STATISTICS
                    // ======================================================

                    const getExchangeStats = (req, res) => {
                        const { user_id } = req.params;

                        if (!user_id) {
                            return res.status(400).json({
                                message: "User ID is required"
                            });
                        }

                        const sql = `
                            SELECT
                                COUNT(
                                    CASE
                                        WHEN status IN ('Pending', 'Accepted')
                                        THEN 1
                                    END
                                ) AS ongoing_exchanges,

                                COUNT(
                                    CASE
                                        WHEN status = 'Completed'
                                        THEN 1
                                    END
                                ) AS completed_exchanges

                            FROM exchange_requests

                            WHERE requester_id = ?
                            OR owner_id = ?
                        `;

                        db.query(
                            sql,
                            [user_id, user_id],
                            (err, results) => {

                                if (err) {
                                    console.error(
                                        "Get exchange stats error:",
                                        err
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to retrieve exchange statistics"
                                    });
                                }

                                res.status(200).json({
                                    ongoing_exchanges:
                                        results[0].ongoing_exchanges || 0,

                                    completed_exchanges:
                                        results[0].completed_exchanges || 0
                                });
                            }
                        );
                    };


module.exports = {
    createExchangeRequest,
    getMyRequests,
    getIncomingRequests,
    updateExchangeRequest,
    completeExchange,
    getExchangeStats
};