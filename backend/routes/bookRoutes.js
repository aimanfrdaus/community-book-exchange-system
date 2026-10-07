const express = require("express");

const {
    addBook,
    getMyBooks,
    updateBook,
    deleteBook,
    getAllBooks
} = require("../controllers/bookController");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/",
    upload.single("cover_image"),
    addBook
);

router.get("/my-books/:user_id", getMyBooks);

router.put(
    "/:book_id",
    upload.single("cover_image"),
    updateBook
);

router.delete("/:book_id", deleteBook);

router.get("/", getAllBooks);

module.exports = router;