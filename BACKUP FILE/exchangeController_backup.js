const db = require("../config/db");

const createExchangeRequest = (req, res) => {
    const { book_id, requester_id } = req.body;

    if (!book_id || !requester_id) {
        return res.status(400).json({
            message: "Book ID and requester ID are required"
        });
    }

    // First, find the book owner
    const getBookSql = `
        SELECT book_id, user_id, status
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
                        message: "Failed to check existing request"
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
                    (err, result) => {
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

                        res.status(201).json({
                            message:
                                "Exchange request created successfully",
                            request_id: result.insertId
                        });
                    }
                );
            }
        );
    });
};

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
                message: "Failed to retrieve exchange requests"
            });
        }

        res.status(200).json({
            requests: results
        });
    });
};


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
                message: "Failed to retrieve incoming requests"
            });
        }

        res.status(200).json({
            requests: results
        });
    });
};


const updateExchangeRequest = (req, res) => {
    const { request_id } = req.params;
    const { status, owner_id } = req.body;

    if (!status || !owner_id) {
        return res.status(400).json({
            message: "Status and owner ID are required"
        });
    }

    if (status !== "Accepted" && status !== "Rejected") {
        return res.status(400).json({
            message: "Invalid status"
        });
    }

    // Make sure the request belongs to this owner
    const checkSql = `
        SELECT
            request_id,
            book_id,
            owner_id,
            status
        FROM exchange_requests
        WHERE request_id = ?
        AND owner_id = ?
    `;

    db.query(
        checkSql,
        [request_id, owner_id],
        (err, results) => {

            if (err) {
                console.error(
                    "Check exchange request error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check exchange request"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Exchange request not found"
                });
            }

            const request = results[0];

            if (request.status !== "Pending") {
                return res.status(400).json({
                    message:
                        "This exchange request has already been processed"
                });
            }

            // Update request status
            const updateSql = `
                UPDATE exchange_requests
                SET status = ?
                WHERE request_id = ?
            `;

            db.query(
                updateSql,
                [status, request_id],
                (err) => {

                    if (err) {
                        console.error(
                            "Update exchange request error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to update exchange request"
                        });
                    }

                    // If accepted, make the book unavailable
                    if (status === "Accepted") {

                        const bookSql = `
                            UPDATE books
                            SET status = 'Unavailable'
                            WHERE book_id = ?
                        `;

                        db.query(
                            bookSql,
                            [request.book_id],
                            (err) => {

                                if (err) {
                                    console.error(
                                        "Update book status error:",
                                        err
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Request updated but book status failed"
                                    });
                                }

                                return res.status(200).json({
                                    message:
                                        "Exchange request accepted successfully"
                                });
                            }
                        );

                    } else {

                        return res.status(200).json({
                            message:
                                "Exchange request rejected successfully"
                        });
                    }
                }
            );
        }
    );
};

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
                    message: "Failed to check exchange"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Exchange request not found"
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
                (err) => {

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

                    return res.status(200).json({
                        message:
                            "Exchange completed successfully"
                    });
                }
            );
        }
    );
};

module.exports = {
    createExchangeRequest,
    getMyRequests,
    getIncomingRequests,
    updateExchangeRequest,
    completeExchange
};