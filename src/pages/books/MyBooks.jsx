import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AddBook from "./AddBook";
import EditBook from "./EditBook";
import API_URL from "../../utils/api";

const MyBooks = () => {
    const { user } = useAuth();

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // PAGE MODE
    const [showAddBookForm, setShowAddBookForm] =
        useState(false);

    const [showEditBookForm, setShowEditBookForm] =
        useState(false);

    const [editingBook, setEditingBook] =
        useState(null);

    const [showDeleteModal, setShowDeleteModal] =
    useState(false);

    const [deletingBook, setDeletingBook] =
    useState(null);


    // FETCH MY BOOKS
    const fetchMyBooks = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/books/my-books/${user.user_id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to retrieve books"
                );
            }

            setBooks(data.books);

        } catch (err) {
            setError(err.message);

        } finally {
            setLoading(false);
        }
    };


    // INITIAL LOAD
    useEffect(() => {
        if (user?.user_id) {
            fetchMyBooks();
        }
    }, [user]);


    // OPEN ADD BOOK
    const openAddBookForm = () => {
        setShowAddBookForm(true);
        setShowEditBookForm(false);
        setEditingBook(null);
        setError("");
    };


    // CLOSE ADD BOOK
    const closeAddBookForm = () => {
        setShowAddBookForm(false);
        setError("");
    };


    // AFTER ADD BOOK SUCCESS
    const handleAddBookSuccess = async () => {
        setShowAddBookForm(false);

        setLoading(true);
        setError("");

        await fetchMyBooks();
    };


    // OPEN EDIT BOOK
    const openEditBookForm = (book) => {
        setEditingBook(book);

        setShowEditBookForm(true);
        setShowAddBookForm(false);

        setError("");
    };


    // CLOSE EDIT BOOK
    const closeEditBookForm = () => {
        setShowEditBookForm(false);
        setEditingBook(null);
        setError("");
    };


    // AFTER EDIT BOOK SUCCESS
    const handleEditBookSuccess = async () => {
        setShowEditBookForm(false);
        setEditingBook(null);

        setLoading(true);
        setError("");

        await fetchMyBooks();
    };


    // DELETE BOOK
// OPEN DELETE CONFIRMATION MODAL
const openDeleteModal = (book) => {
    setDeletingBook(book);
    setShowDeleteModal(true);
};


// CLOSE DELETE CONFIRMATION MODAL
const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingBook(null);
};


// CONFIRM DELETE
    const confirmDelete = async () => {
        if (!deletingBook) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/books/${deletingBook.book_id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete book"
                );
            }

            setBooks((currentBooks) =>
                currentBooks.filter(
                    (book) =>
                        book.book_id !==
                        deletingBook.book_id
                )
            );

            closeDeleteModal();

        } catch (err) {
            setError(err.message);
            closeDeleteModal();
        }
    };


    // SEARCH
    const filteredBooks = books.filter((book) => {
        const search = searchTerm.toLowerCase();

        return (
            (book.title || "")
                .toLowerCase()
                .includes(search) ||
            (book.author || "")
                .toLowerCase()
                .includes(search)
        );
    });


    return (
        <div>

            {/* ADD BOOK MODE */}
            {showAddBookForm ? (

                <AddBook
                    onBack={closeAddBookForm}
                    onSuccess={handleAddBookSuccess}
                />

            ) : showEditBookForm ? (

                /* EDIT BOOK MODE */
                <EditBook
                    book={editingBook}
                    onBack={closeEditBookForm}
                    onSuccess={handleEditBookSuccess}
                />

            ) : (

                /* MY BOOKS MODE */
                <>

                    {/* PAGE HEADER */}
                    <div className="page-header">

                        <div>

                            <h1>
                                My Books
                            </h1>

                            <p>
                                Manage the books you have
                                listed for community exchange.
                            </p>

                        </div>


                        <button
                            className="header-primary-button"
                            onClick={
                                openAddBookForm
                            }
                        >
                            + Add New Book
                        </button>

                    </div>


                    {/* SEARCH */}
                    <div className="my-books-toolbar">

                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search by title or author..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                        />

                        <span className="book-count">

                            {filteredBooks.length} book
                            {filteredBooks.length !== 1
                                ? "s"
                                : ""}

                        </span>

                    </div>


                    {/* LOADING */}
                    {loading && (

                        <div className="empty-state">

                            <p>
                                Loading your books...
                            </p>

                        </div>

                    )}


                    {/* ERROR */}
                    {error && (

                        <div className="error-message">

                            {error}

                        </div>

                    )}


                    {/* NO BOOKS */}
                    {!loading &&
                        !error &&
                        books.length === 0 && (

                            <div className="empty-state">

                                <h3>
                                    You haven't listed any
                                    books yet
                                </h3>

                                <p>
                                    Add your first book and make
                                    it available for exchange
                                    with the community.
                                </p>

                                <button
                                    className="primary-button"
                                    onClick={
                                        openAddBookForm
                                    }
                                >
                                    + Add New Book
                                </button>

                            </div>

                        )}


                    {/* SEARCH RESULT EMPTY */}
                    {!loading &&
                        !error &&
                        books.length > 0 &&
                        filteredBooks.length === 0 && (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    🔎
                                </div>

                                <h3>
                                    No books found
                                </h3>

                                <p>
                                    Try searching with a
                                    different title or author.
                                </p>

                            </div>

                        )}


                    {/* BOOK LIST */}
                    {!loading &&
                        !error &&
                        filteredBooks.length > 0 && (

                            <div className="my-books-grid">

                                {filteredBooks.map((book) => (

                                    <div
                                        className="my-book-card"
                                        key={book.book_id}
                                    >

                                        {/* COVER */}
                                        <div className="my-book-cover">

                                            {book.cover_image ? (

                                                <img
                                                    src={`${API_URL}/uploads/${book.cover_image}`}
                                                    alt={`${book.title} cover`}
                                                    className="my-book-cover-image"
                                                />

                                            ) : (

                                                <div className="my-book-cover-placeholder">

                                                    <span>
                                                        📖
                                                    </span>

                                                    <p>
                                                        No cover available
                                                    </p>

                                                </div>

                                            )}

                                        </div>


                                        {/* BOOK CONTENT */}
                                        <div className="my-book-content">

                                            {/* STATUS */}
                                            <div className="my-book-status">

                                                <span
                                                    className={`status-badge ${
                                                        book.status ===
                                                        "Available"
                                                            ? "status-available"
                                                            : book.status ===
                                                              "Reserved"
                                                            ? "status-reserved"
                                                            : "status-exchanged"
                                                    }`}
                                                >
                                                    {book.status}
                                                </span>

                                            </div>


                                            {/* TITLE */}
                                            <h2>
                                                {book.title}
                                            </h2>


                                            {/* AUTHOR */}
                                            <p className="my-book-author">
                                                by {book.author}
                                            </p>


                                            {/* DETAILS */}
                                            <div className="my-book-details">

                                                <div>

                                                    <span>
                                                        Genre
                                                    </span>

                                                    <strong>
                                                        {book.genre ||
                                                            "Not specified"}
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Condition
                                                    </span>

                                                    <strong>
                                                        {book.condition_status ||
                                                            "Not specified"}
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Location
                                                    </span>

                                                    <strong>
                                                        {book.location ||
                                                            "Not specified"}
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* DESCRIPTION */}
                                            <p className="my-book-description">

                                                {book.description ||
                                                    "No description available."}

                                            </p>


                                            {/* ACTIONS */}
                                            <div className="my-book-actions">

                                                <button
                                                    className="edit-secondary-button"
                                                    onClick={() =>
                                                        openEditBookForm(
                                                            book
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        openDeleteModal(book)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                </>

            )}

            {/* DELETE CONFIRMATION MODAL */}
{showDeleteModal && deletingBook && (
    <div
        className="delete-modal-overlay"
        onClick={closeDeleteModal}
    >
        <div
            className="delete-modal"
            onClick={(e) =>
                e.stopPropagation()
            }
        >

            <div className="delete-modal-icon">
                🗑️
            </div>

            <h2>
                Delete Book
            </h2>

            <p>
                Are you sure you want to delete
                <strong>
                    {" "}{deletingBook.title}
                </strong>
                ?
            </p>

            <p className="delete-modal-warning">
                This action cannot be undone.
            </p>

            <div className="delete-modal-actions">

                <button
                    className="delete-cancel-button"
                    onClick={closeDeleteModal}
                >
                    Cancel
                </button>

                <button
                    className="delete-confirm-button"
                    onClick={confirmDelete}
                >
                    Delete
                </button>

            </div>

        </div>
    </div>
)}

        </div>
    );
};

export default MyBooks;
