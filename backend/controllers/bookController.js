const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// ===============================
// ADD BOOK
// ===============================
const addBook = (req, res) => {
    const {
        user_id,
        title,
        author,
        genre,
        condition_status,
        description,
        location
    } = req.body;

    // Check required fields
    if (!user_id || !title || !author) {
        return res.status(400).json({
            message: "User ID, title and author are required"
        });
    }

    // Get uploaded cover image filename
    const coverImage = req.file
        ? req.file.filename
        : null;

    const sql = `
        INSERT INTO books
        (
            user_id,
            title,
            author,
            genre,
            condition_status,
            description,
            cover_image,
            location
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        user_id,
        title,
        author,
        genre || null,
        condition_status || null,
        description || null,
        coverImage,
        location || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Add book error:", err);

            return res.status(500).json({
                message: "Failed to add book"
            });
        }

        res.status(201).json({
            message: "Book added successfully",
            book_id: result.insertId,
            cover_image: coverImage
        });
    });
};


// ===============================
// GET MY BOOKS
// ===============================
const getMyBooks = (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT
            book_id,
            title,
            author,
            genre,
            condition_status,
            description,
            cover_image,
            location,
            status,
            created_at
        FROM books
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Get books error:", err);

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


// ===============================
// UPDATE BOOK
// ===============================
const updateBook = (req, res) => {
    const { book_id } = req.params;

    const {
        title,
        author,
        genre,
        condition_status,
        description,
        location,
        status,
        remove_cover
    } = req.body;

    if (!title || !author) {
        // If a new image was uploaded but validation fails,
        // remove the newly uploaded file.
        if (req.file) {
            fs.unlink(
                path.join(
                    __dirname,
                    "../uploads",
                    req.file.filename
                ),
                () => {}
            );
        }

        return res.status(400).json({
            message: "Title and author are required"
        });
    }

    // First get the existing book
    const getBookSql = `
        SELECT cover_image
        FROM books
        WHERE book_id = ?
    `;

    db.query(
        getBookSql,
        [book_id],
        (err, results) => {
            if (err) {
                console.error(
                    "Get book before update error:",
                    err
                );

                if (req.file) {
                    fs.unlink(
                        path.join(
                            __dirname,
                            "../uploads",
                            req.file.filename
                        ),
                        () => {}
                    );
                }

                return res.status(500).json({
                    message: "Failed to update book"
                });
            }

            if (results.length === 0) {
                if (req.file) {
                    fs.unlink(
                        path.join(
                            __dirname,
                            "../uploads",
                            req.file.filename
                        ),
                        () => {}
                    );
                }

                return res.status(404).json({
                    message: "Book not found"
                });
            }

            const oldCover = results[0].cover_image;

            let sql;
            let values;

            // =========================
            // NEW COVER IMAGE
            // =========================
            if (req.file) {
                sql = `
                    UPDATE books
                    SET
                        title = ?,
                        author = ?,
                        genre = ?,
                        condition_status = ?,
                        description = ?,
                        cover_image = ?,
                        location = ?,
                        status = ?
                    WHERE book_id = ?
                `;

                values = [
                    title,
                    author,
                    genre || null,
                    condition_status || null,
                    description || null,
                    req.file.filename,
                    location || null,
                    status || "Available",
                    book_id
                ];
            }

            // =========================
            // REMOVE COVER IMAGE
            // =========================
            else if (remove_cover === "true") {
                sql = `
                    UPDATE books
                    SET
                        title = ?,
                        author = ?,
                        genre = ?,
                        condition_status = ?,
                        description = ?,
                        cover_image = NULL,
                        location = ?,
                        status = ?
                    WHERE book_id = ?
                `;

                values = [
                    title,
                    author,
                    genre || null,
                    condition_status || null,
                    description || null,
                    location || null,
                    status || "Available",
                    book_id
                ];
            }

            // =========================
            // NO COVER CHANGE
            // =========================
            else {
                sql = `
                    UPDATE books
                    SET
                        title = ?,
                        author = ?,
                        genre = ?,
                        condition_status = ?,
                        description = ?,
                        location = ?,
                        status = ?
                    WHERE book_id = ?
                `;

                values = [
                    title,
                    author,
                    genre || null,
                    condition_status || null,
                    description || null,
                    location || null,
                    status || "Available",
                    book_id
                ];
            }

            db.query(
                sql,
                values,
                (updateErr, result) => {
                    if (updateErr) {
                        console.error(
                            "Update book error:",
                            updateErr
                        );

                        // Remove newly uploaded image
                        // if database update failed.
                        if (req.file) {
                            fs.unlink(
                                path.join(
                                    __dirname,
                                    "../uploads",
                                    req.file.filename
                                ),
                                () => {}
                            );
                        }

                        return res.status(500).json({
                            message:
                                "Failed to update book"
                        });
                    }

                    // =========================
                    // DELETE OLD COVER
                    // =========================
                    if (
                        oldCover &&
                        (req.file ||
                            remove_cover === "true")
                    ) {
                        const oldCoverPath = path.join(
                            __dirname,
                            "../uploads",
                            path.basename(oldCover)
                        );

                        fs.unlink(
                            oldCoverPath,
                            (deleteErr) => {
                                if (
                                    deleteErr &&
                                    deleteErr.code !==
                                        "ENOENT"
                                ) {
                                    console.error(
                                        "Failed to delete old cover:",
                                        deleteErr
                                    );
                                }
                            }
                        );
                    }

                    res.status(200).json({
                        message:
                            "Book updated successfully",
                        cover_image: req.file
                            ? req.file.filename
                            : remove_cover === "true"
                            ? null
                            : oldCover
                    });
                }
            );
        }
    );
};


// ===============================
// DELETE BOOK
// ===============================
const deleteBook = (req, res) => {
    const { book_id } = req.params;

    const sql = `
        DELETE FROM books
        WHERE book_id = ?
    `;

    db.query(sql, [book_id], (err, result) => {
        if (err) {
            console.error("Delete book error:", err);

            return res.status(500).json({
                message: "Failed to delete book"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully"
        });
    });
};


// ===============================
// GET ALL AVAILABLE BOOKS
// ===============================
const getAllBooks = (req, res) => {
    const sql = `
        SELECT
            books.book_id,
            books.title,
            books.author,
            books.genre,
            books.condition_status,
            books.description,
            books.cover_image,
            books.location,
            books.status,
            books.user_id,
            users.name AS owner_name
        FROM books
        INNER JOIN users
            ON books.user_id = users.user_id
        WHERE books.status = 'Available'
        ORDER BY books.book_id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get all books error:", err);

            return res.status(500).json({
                message: "Failed to retrieve books"
            });
        }

        res.status(200).json({
            books: results
        });
    });
};


module.exports = {
    addBook,
    getMyBooks,
    updateBook,
    deleteBook,
    getAllBooks
};