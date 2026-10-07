import { useEffect, useState } from "react";
import API_URL from "../../utils/api";

const BookManagement = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedBook, setSelectedBook] = useState(null);

    const [bookToDelete, setBookToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState("");

const handleViewDetails = (book) => {
    setSelectedBook(book);
};

const closeBookDetails = () => {
    setSelectedBook(null);
};

const handleDeleteClick = (book) => {
    setBookToDelete(book);
};

const closeDeleteModal = () => {
    if (!deleting) {
        setBookToDelete(null);
    }
};

const handleDeleteBook = async () => {
    if (!bookToDelete) {
        return;
    }

    try {
        setDeleting(true);

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/api/admin/books/${bookToDelete.book_id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to delete book"
            );
        }

        setBooks((prevBooks) =>
            prevBooks.filter(
                (book) =>
                    book.book_id !== bookToDelete.book_id
            )
        );

        setBookToDelete(null);
        setDeleteSuccess(data.message);

    } catch (err) {
        setError(err.message);
        console.error("Delete book error:", err);

    } finally {
        setDeleting(false);
    }
};

    useEffect(() => {


        const fetchBooks = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/admin/books`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to retrieve books"
                    );
                }

                setBooks(data.books);

            } catch (err) {
                setError(err.message);

                console.error("Get books error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // Filter books
    const filteredBooks = books.filter((book) => {
        const title = book.title?.toLowerCase() || "";
        const author = book.author?.toLowerCase() || "";

        const matchesSearch =
            title.includes(search.toLowerCase()) ||
            author.includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            book.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    // Summary counts
    const totalBooks = books.length;

    const availableBooks = books.filter(
        (book) => book.status?.toLowerCase() === "available"
    ).length;

    const unavailableBooks = books.filter(
        (book) => book.status?.toLowerCase() === "unavailable"
    ).length;

    // Loading state
    if (loading) {
        return (
            <div className="admin-page-container">
                <div className="admin-loading">
                    <div className="admin-loading-icon">⏳</div>

                    <h3>Loading Books</h3>

                    <p>
                        Please wait while we retrieve the book listings.
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="admin-page-container">
                <div className="admin-error">
                    <div className="admin-error-icon">⚠️</div>

                    <h3>Unable to Load Books</h3>

                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-container">

            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1>Book Management</h1>

                    <p>
                        Monitor and manage books listed in the exchange
                        system.
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="book-admin-summary">

                <div className="book-admin-summary-card is-total">


                    <div>
                        <span>Total Books</span>
                        <strong>{totalBooks}</strong>
                    </div>
                </div>

                <div className="book-admin-summary-card is-available">


                    <div>
                        <span>Available</span>
                        <strong>{availableBooks}</strong>
                    </div>
                </div>

                <div className="book-admin-summary-card is-unavailable">

                    <div>
                        <span>Unavailable</span>
                        <strong>{unavailableBooks}</strong>
                    </div>
                </div>

            </div>

            {/* Search and Filter */}
            <div className="book-management-toolbar">

                <div className="book-search-box">
                    <span>🔎</span>

                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="book-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                </select>

                <div className="book-count">
                    Showing <strong>{filteredBooks.length}</strong> of{" "}
                    <strong>{books.length}</strong> books
                </div>

            </div>

            {/* Books Table */}
            <div className="admin-table-card">

                {books.length === 0 ? (
                    <div className="empty-state">

                        <div className="empty-icon">
                            📚
                        </div>

                        <h3>No Books Found</h3>

                        <p>
                            There are currently no books listed in the system.
                        </p>

                    </div>
                ) : filteredBooks.length === 0 ? (
                    <div className="empty-state">

                        <div className="empty-icon">
                            🔎
                        </div>

                        <h3>No Matching Books</h3>

                        <p>
                            No books match your current search or filter.
                        </p>

                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Book</th>
                                    <th>Genre</th>
                                    <th>Condition</th>
                                    <th>Owner</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredBooks.map((book) => (

                                    <tr key={book.book_id}>

                                        {/* ID */}
                                        <td>
                                            <span className="book-id">
                                                #{book.book_id}
                                            </span>
                                        </td>

                                        {/* Book */}
                                        <td>
                                            <div className="admin-book-info">

{book.cover_image ? (
    <img
        src={`${API_URL}/uploads/${book.cover_image}`}
        alt={book.title}
        className="admin-book-cover"
    />
) : (
    <div className="admin-book-icon">
        📖
    </div>
)}

                                                <div>
                                                    <strong>
                                                        {book.title}
                                                    </strong>

                                                    <span>
                                                        by {book.author}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Genre */}
                                        <td>
                                            {book.genre || (
                                                <span className="not-specified">
                                                    Not specified
                                                </span>
                                            )}
                                        </td>

                                        {/* Condition */}
                                        <td>
                                            {book.condition_status || (
                                                <span className="not-specified">
                                                    Not specified
                                                </span>
                                            )}
                                        </td>

                                        {/* Owner */}
                                        <td>
                                            <div className="book-owner-info">
                                                <strong>
                                                    {book.owner_name}
                                                </strong>

                                                <span>
                                                    {book.owner_email}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td>
                                            {book.location || (
                                                <span className="not-specified">
                                                    Not specified
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span
                                                className={`book-status ${
                                                    book.status?.toLowerCase() ===
                                                    "available"
                                                        ? "book-status-available"
                                                        : "book-status-unavailable"
                                                }`}
                                            >
                                                <span className="book-status-dot">
                                                    ●
                                                </span>

                                                {book.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="admin-book-actions">

                                                <button
                                                    type="button"
                                                    className="admin-view-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(book);
                                                    }}
                                                >
                                                    View Details
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-delete-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(book);
                                                    }}
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

{selectedBook && (
    <div
        className="admin-book-details-overlay"
        onClick={closeBookDetails}
    >
        <div
            className="admin-book-details-modal"
            onClick={(e) => e.stopPropagation()}
        >

            <div className="admin-book-details-header">

                <div>
                    <h2>Book Details</h2>

                    <p>
                        Complete information about this book.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-book-details-close"
                    onClick={closeBookDetails}
                >
                    ×
                </button>

            </div>

            <div className="admin-book-details-content">

                {/* Book Cover */}
                <div className="admin-book-details-cover">

                {selectedBook.cover_image ? (
                    <img
                        src={`${API_URL}/uploads/${selectedBook.cover_image}`}
                        alt={selectedBook.title}
                    />
                ) : (
                    <div className="admin-book-no-cover">
                        📖
                    </div>
                )}

                </div>

                

                {/* Book Information */}
                <div className="admin-book-details-info">

                    <h3>
                        {selectedBook.title}
                    </h3>

                    <p className="admin-book-details-author">
                        by {selectedBook.author}
                    </p>

                    <div className="admin-book-details-grid">

                        <div>
                            <span>Book ID</span>
                            <strong>
                                #{selectedBook.book_id}
                            </strong>
                        </div>

                        <div>
                            <span>Genre</span>
                            <strong>
                                {selectedBook.genre ||
                                    "Not specified"}
                            </strong>
                        </div>

                        <div>
                            <span>Condition</span>
                            <strong>
                                {selectedBook.condition_status ||
                                    "Not specified"}
                            </strong>
                        </div>

                        <div>
                            <span>Status</span>
                            <strong>
                                {selectedBook.status ||
                                    "Not specified"}
                            </strong>
                        </div>

                        <div>
                            <span>Location</span>
                            <strong>
                                {selectedBook.location ||
                                    "Not specified"}
                            </strong>
                        </div>

                        <div>
                            <span>Owner</span>
                            <strong>
                                {selectedBook.owner_name ||
                                    "Not specified"}
                            </strong>
                        </div>

                    </div>

                    <div className="admin-book-details-description">

                        <span>Description</span>

                        <p>
                            {selectedBook.description ||
                                "No description provided."}
                        </p>

                    </div>

                </div>

            </div>

            <div className="admin-book-details-actions">

                <button
                    type="button"
                    className="secondary-button"
                    onClick={closeBookDetails}
                >
                    Close
                </button>

            </div>

        </div>
    </div>
)}

{bookToDelete && (
    <div
        className="admin-delete-overlay"
        onClick={closeDeleteModal}
    >
        <div
            className="admin-delete-modal"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="admin-delete-icon">
                ⚠️
            </div>

            <h2>Delete Book?</h2>

            <p>
                Are you sure you want to delete{" "}
                <strong>
                    "{bookToDelete.title}"
                </strong>
                ?
            </p>

            <p className="admin-delete-warning">
                This action cannot be undone.
            </p>

            <div className="admin-delete-actions">

                <button
                    type="button"
                    className="secondary-button"
                    onClick={closeDeleteModal}
                    disabled={deleting}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className="admin-confirm-delete-button"
                    onClick={handleDeleteBook}
                    disabled={deleting}
                >
                    {deleting
                        ? "Deleting..."
                        : "Delete Book"}
                </button>

            </div>
        </div>
    </div>
)}

        </div>
    );
};

export default BookManagement;

