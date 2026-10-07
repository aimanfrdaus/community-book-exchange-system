import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import BookPreview from "./BookPreview";
import API_URL from "../../utils/api";

    const BrowseBooks = () => {
    const { user } = useAuth();

    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [ownerRatings, setOwnerRatings] = useState({});

    const [genreFilter, setGenreFilter] = useState("");
    const [conditionFilter, setConditionFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);
    const [requestBook, setRequestBook] = useState(null);

    const [showRequestModal, setShowRequestModal] = useState(false);

    const [showRequestError, setShowRequestError] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState("");


const openBookPreview = (book) => {
    setSelectedBook(book);
};

const closeBookPreview = () => {
    setSelectedBook(null);
};

const openRequestModal = (book) => {
    setRequestBook(book);
    setShowRequestModal(true);
};

        const requestExchange = async (bookId) => {
            try {
                const response = await fetch(
    `${API_URL}/api/exchanges`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            book_id: bookId,
                            requester_id: user.user_id,
                        }),
                    }   
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to create exchange request"
                    );
                }

                setShowRequestModal(false);
                setRequestBook(null);

            } catch (err) {
                setRequestErrorMessage(err.message);
                setShowRequestError(true);
            }
        };

    // ===============================
    // FETCH OWNER RATINGS
    // ===============================
    const fetchOwnerRatings = async (booksData) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const ownerIds = [
                ...new Set(
                    booksData
                        .map((book) => book.user_id)
                        .filter(Boolean)
                ),
            ];

            const ratingsData = {};

            await Promise.all(
                ownerIds.map(async (ownerId) => {
                    try {
                        const response = await fetch(
                            `${API_URL}/api/ratings/user/${ownerId}`,
                            {
                                method: "GET",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        const data = await response.json();

                        if (!response.ok) {
                            return;
                        }

                        if (data.length > 0) {
                            const total = data.reduce(
                                (sum, rating) =>
                                    sum +
                                    Number(rating.rating),
                                0
                            );

                            const average =
                                total / data.length;

                            ratingsData[ownerId] = {
                                average:
                                    Math.round(
                                        average * 10
                                    ) / 10,
                                count: data.length,
                            };
                        } else {
                            ratingsData[ownerId] = {
                                average: 0,
                                count: 0,
                            };
                        }

                    } catch (error) {
                        console.error(
                            `Failed to fetch rating for user ${ownerId}:`,
                            error
                        );
                    }
                })
            );

            setOwnerRatings(ratingsData);

        } catch (error) {
            console.error(
                "Failed to fetch owner ratings:",
                error
            );
        }
    };

const confirmRequestExchange = async () => {
    if (!requestBook) {
        return;
    }

    await requestExchange(requestBook.book_id);

    setShowRequestModal(false);
    setRequestBook(null);
};

    // ===============================
    // FETCH BOOKS
    // ===============================
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/books`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to retrieve books"
                    );
                }

                setBooks(data.books);
                fetchOwnerRatings(data.books);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const genres = [
        ...new Set(
            books
                .map((book) => book.genre)
                .filter(Boolean)
        ),
    ];

    const locations = [
        ...new Set(
            books
                .map((book) => book.location)
                .filter(Boolean)
        ),
    ];

    const filteredBooks = books.filter((book) => {
        const search = searchTerm.toLowerCase();

        const title = (book.title || "").toLowerCase();
        const author = (book.author || "").toLowerCase();

        const matchesSearch =
            title.includes(search) ||
            author.includes(search);

        const matchesGenre =
            !genreFilter ||
            book.genre === genreFilter;

        const matchesCondition =
            !conditionFilter ||
            book.condition_status === conditionFilter;

        const matchesLocation =
            !locationFilter ||
            book.location === locationFilter;

        return (
            matchesSearch &&
            matchesGenre &&
            matchesCondition &&
            matchesLocation
        );
    });

    const clearFilters = () => {
        setSearchTerm("");
        setGenreFilter("");
        setConditionFilter("");
        setLocationFilter("");
    };

    return (
        <div>

            {/* ===============================
                PAGE HEADER
            =============================== */}
            <div className="page-header">
                <div>
                    <h1>Browse Books</h1>

                    <p>
                        Discover books listed by members
                        of the community and find your
                        next exchange.
                    </p>
                </div>
            </div>


            {/* ===============================
                SEARCH AND FILTERS
            =============================== */}
            <div className="browse-filter-card">

                <div className="browse-search">

                    <span>🔎</span>

                    <input
                        type="text"
                        placeholder="Search by book title or author..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />

                </div>


                <div className="filter-row">

                    <select
                        value={genreFilter}
                        onChange={(e) =>
                            setGenreFilter(e.target.value)
                        }
                    >
                        <option value="">
                            All Genres
                        </option>

                        {genres.map((genre) => (
                            <option
                                key={genre}
                                value={genre}
                            >
                                {genre}
                            </option>
                        ))}
                    </select>


                    <select
                        value={conditionFilter}
                        onChange={(e) =>
                            setConditionFilter(e.target.value)
                        }
                    >
                        <option value="">
                            All Conditions
                        </option>

                        <option value="New">
                            New
                        </option>

                        <option value="Like New">
                            Like New
                        </option>

                        <option value="Good">
                            Good
                        </option>

                        <option value="Fair">
                            Fair
                        </option>
                    </select>


                    <select
                        value={locationFilter}
                        onChange={(e) =>
                            setLocationFilter(e.target.value)
                        }
                    >
                        <option value="">
                            All Locations
                        </option>

                        {locations.map((location) => (
                            <option
                                key={location}
                                value={location}
                            >
                                {location}
                            </option>
                        ))}
                    </select>


                    <button
                        className="clear-filter-button"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>

                </div>

            </div>


            {/* ===============================
                RESULT COUNT
            =============================== */}
            {!loading && !error && (
                <div className="browse-results-header">

                    <div>
                        <strong>
                            {filteredBooks.length}
                        </strong>{" "}
                        book
                        {filteredBooks.length !== 1
                            ? "s"
                            : ""}{" "}
                        found
                    </div>

                </div>
            )}


            {/* ===============================
                LOADING
            =============================== */}
            {loading && (
                <div className="empty-state">
                    <p>Loading books...</p>
                </div>
            )}


            {/* ===============================
                ERROR
            =============================== */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* ===============================
                NO RESULTS
            =============================== */}
            {!loading &&
                !error &&
                filteredBooks.length === 0 && (

                    <div className="empty-state">

                        <div className="empty-icon">
                            🔎
                        </div>

                        <h3>No books found</h3>

                        <p>
                            Try changing your search term
                            or filters to find more books.
                        </p>

                        <button
                            className="primary-button"
                            onClick={clearFilters}
                        >
                            Clear Search & Filters
                        </button>

                    </div>
                )}


            {/* ===============================
                BOOKS
            =============================== */}
            {!loading &&
                !error &&
                filteredBooks.length > 0 && (

                <div className="browse-book-grid">

                    {filteredBooks.map((book) => (
                        <div
                            key={book.book_id}
                            className="browse-book-card"
                            onClick={() =>
                                openBookPreview(book)
                            }
                        >

                                {/* ===============================
                                    BOOK COVER
                                =============================== */}
                                <div className="browse-book-cover">

                                    {book.cover_image ? (

                                <img
                                    src={book.cover_image}
                                    alt={`${book.title} cover`}
                                    className="browse-book-cover-image"
                                />

                                    ) : (

                                        <div className="browse-book-cover-placeholder">
                                            <span>📖</span>
                                            <p>
                                                No cover available
                                            </p>
                                        </div>

                                    )}

                                </div>


                                {/* ===============================
                                    BOOK CONTENT
                                =============================== */}
                                <div className="browse-book-content">

                                    <div className="browse-book-status">

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


                                    <h2>
                                        {book.title}
                                    </h2>


                                    <p className="browse-book-author">
                                        by {book.author}
                                    </p>


                                    <div className="browse-book-info">

                                        <div>
                                            <span>Genre</span>

                                            <strong>
                                                {book.genre ||
                                                    "Not specified"}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>Condition</span>

                                            <strong>
                                                {book.condition_status ||
                                                    "Not specified"}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>Location</span>

                                            <strong>
                                                {book.location ||
                                                    "Not specified"}
                                            </strong>
                                        </div>

                                    </div>


                                    <p className="browse-book-description">
                                        {book.description ||
                                            "No description available."}
                                    </p>


                                    {/* ===============================
                                        OWNER
                                    =============================== */}
                                    <div className="book-owner">

                                        <span>Owner</span>

                                        <strong>
                                            {book.owner_name}
                                        </strong>


                                        {ownerRatings[
                                            book.user_id
                                        ] &&
                                            ownerRatings[
                                                book.user_id
                                            ].count > 0 && (

                                                <span className="book-owner-rating">

                                                    <span>
                                                        ★
                                                    </span>

                                                    <span className="book-owner-rating-value">
                                                        {
                                                            ownerRatings[
                                                                book.user_id
                                                            ].average
                                                        }
                                                    </span>

                                                    <span className="book-owner-rating-count">
                                                        (
                                                        {
                                                            ownerRatings[
                                                                book.user_id
                                                            ].count
                                                        }
                                                        )
                                                    </span>

                                                </span>
                                            )}

                                    </div>


                                    {/* ===============================
                                        EXCHANGE BUTTON
                                    =============================== */}
                                    {user &&
                                        user.user_id !==
                                            book.user_id && (

                                    <button
                                        className="exchange-button"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            openRequestModal(book);
                                        }}
                                        disabled={
                                            book.status !==
                                            "Available"
                                        }
                                    >
                                        {book.status ===
                                        "Available"
                                            ? "Request Exchange"
                                            : "Not Available"}
                                    </button>

                                        )}


                                    {/* ===============================
                                        OWN BOOK
                                    =============================== */}
                                    {user &&
                                        user.user_id ===
                                            book.user_id && (

                                            <div className="own-book-message">
                                                This is your book
                                            </div>

                                        )}


                                </div>

                            </div>

                        ))}
                                {selectedBook && (
                                    <BookPreview
                                        book={selectedBook}
                                        onClose={closeBookPreview}
                                        onRequestExchange={(book) =>
                                            openRequestModal(book)
                                        }
                                    />
                                )}

{showRequestModal && requestBook && (
    <div
        className="request-modal-overlay"
        onClick={() =>
            setShowRequestModal(false)
        }
    >

        <div
            className="request-modal"
            onClick={(e) =>
                e.stopPropagation()
            }
        >

            <div className="request-modal-icon">
                📚
            </div>

            <h2>Request Book</h2>

            <p>
                Are you sure you want to request
                <strong>
                    {" "}{requestBook.title}
                </strong>
                {" "}for exchange?
            </p>

            <div className="request-modal-actions">

               <button
                    className="request-cancel-button"
                    onClick={() => {
                        setShowRequestModal(false);
                        setRequestBook(null);
                    }}
                >
                    Cancel
                </button>

                <button
                    className="request-confirm-button"
                    onClick={confirmRequestExchange}
                >
                    Confirm Request
                </button>

            </div>

        </div>

    </div>
)}

{showRequestError && (
    <div
        className="request-modal-overlay"
        onClick={() =>
            setShowRequestError(false)
        }
    >
        <div
            className="request-modal"
            onClick={(e) =>
                e.stopPropagation()
            }
        >
            <div className="request-warning-icon">
                !
            </div>

            <h2>Request Already Sent</h2>

            <p>
                {requestErrorMessage}
            </p>

            <div className="request-modal-actions">
                <button
                    className="request-confirm-button"
                    onClick={() =>
                        setShowRequestError(false)
                    }
                >
                    OK
                </button>
            </div>
        </div>
    </div>
)}

                                
                    </div>



                )}

                

        </div>
        
    );
    
};

export default BrowseBooks;
