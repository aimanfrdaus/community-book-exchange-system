import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../utils/api";

const Dashboard = () => {
    const { user } = useAuth();

const [books, setBooks] = useState([]);

const [ongoingExchanges, setOngoingExchanges] =
    useState(0);

const [completedExchanges, setCompletedExchanges] =
    useState(0);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
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

        if (user?.user_id) {
            fetchMyBooks();
            fetchExchangeStats();
        }
    }, [user]);

    const fetchExchangeStats = async () => {
    try {
        const response = await fetch(
            `${API_URL}/api/exchanges/stats/${user.user_id}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                    "Failed to retrieve exchange statistics"
            );
        }

        setOngoingExchanges(
            data.ongoing_exchanges || 0
        );

        setCompletedExchanges(
            data.completed_exchanges || 0
        );

    } catch (err) {
        console.error(
            "Exchange statistics error:",
            err
        );
    }
};

    const handleDelete = async (bookId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this book?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/books/${bookId}`,
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
                        book.book_id !== bookId
                )
            );

        } catch (err) {
            alert(err.message);
        }
    };

    const availableBooks = books.filter(
        (book) => book.status === "Available"
    ).length;


    return (
        <div>

            {/* ===============================
                PAGE HEADER
            ================================ */}

            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Welcome back, {user?.name}! Here's an overview of your book
                        exchange activity.
                    </p>
                </div>
            </div>



            {/* ===============================
                SUMMARY CARDS
            =============================== */}
            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <h3>My Books</h3>

                    <strong>
                        {books.length}
                    </strong>

                    <p className="card-description">
                        Total books listed
                    </p>
                </div>


                <div className="dashboard-card">
                    <h3>Available</h3>

                    <strong>
                        {availableBooks}
                    </strong>

                    <p className="card-description">
                        Ready for exchange
                    </p>
                </div>



                <div className="dashboard-card">
                    <h3>Ongoing Exchanges</h3>

                    <strong>
                        {ongoingExchanges}
                    </strong>

                    <p className="card-description">
                        Pending or accepted exchanges
                    </p>
                </div>


                <div className="dashboard-card">
                    <h3>Completed Exchanges</h3>

                    <strong>
                        {completedExchanges}
                    </strong>

                    <p className="card-description">
                        Successfully completed
                    </p>
                </div>

            </div>


            {/* ===============================
                QUICK ACTIONS
            =============================== */}
            <div className="dashboard-section">

                <div className="section-header">

                    <div>
                        <h2>Quick Actions</h2>

                        <p>
                            Manage your book exchange
                            activities.
                        </p>
                    </div>

                </div>


                <div className="quick-actions">

                    <button
                        className="action-card"
                        onClick={() =>
                            navigate("/browse-books")
                        }
                    >
                        <div>
                            <strong>
                                Browse Books
                            </strong>

                            <p>
                                Find books available
                                for exchange.
                            </p>
                        </div>
                    </button>


                    <button
                        className="action-card"
                        onClick={() =>
                            navigate("/my-requests")
                        }
                    >
                        <div>
                            <strong>
                                My Requests
                            </strong>

                            <p>
                                View your outgoing
                                exchange requests.
                            </p>
                        </div>
                    </button>


                    <button
                        className="action-card"
                        onClick={() =>
                            navigate(
                                "/incoming-requests"
                            )
                        }
                    >
                        <div>
                            <strong>
                                Incoming Requests
                            </strong>

                            <p>
                                Manage requests for
                                your books.
                            </p>
                        </div>
                    </button>

                </div>

            </div>


            {/* ===============================
                MY BOOKS
            =============================== */}
            <div className="dashboard-section">

                <div className="section-header">

                    <div>
                        <h2>My Books</h2>

                        <p>
                            Books that you have listed
                            in the community.
                        </p>
                    </div>


                    {books.length > 0 && (

                        <button
                            className="secondary-button"
                            onClick={() =>
                                navigate("/my-books")
                            }
                        >
                            View All
                        </button>

                    )}

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
                                No books listed yet
                            </h3>

                            <p>
                                Start sharing your books
                                with the community by
                                creating your first
                                listing.
                            </p>

                        </div>
                    )}


                {/* BOOKS */}
                {!loading &&
                    !error &&
                    books.length > 0 && (

                        <div className="book-grid">

                            {books
                                .slice(0, 4)
                                .map((book) => (

                                    <div
                                        className="book-card"
                                        key={book.book_id}
                                    >

                                        {/* BOOK COVER */}
                                        <div className="book-cover">

                                            {book.cover_image ? (

                                                <img
                                                    src={`${API_URL}/uploads/${book.cover_image}`}
                                                    alt={`${book.title} cover`}
                                                    className="dashboard-book-cover-image"
                                                />

                                            ) : (

                                                <div className="dashboard-book-cover-placeholder">
                                                    <span>
                                                        📖
                                                    </span>

                                                    <p>
                                                        No cover
                                                        available
                                                    </p>
                                                </div>

                                            )}

                                        </div>


                                        <div className="book-card-content">

                                            <div className="book-card-top">

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


                                            <h3>
                                                {book.title}
                                            </h3>


                                            <p className="book-author">
                                                by {book.author}
                                            </p>


                                            <div className="book-details">

                                                <span>
                                                    {book.genre ||
                                                        "No genre"}
                                                </span>

                                                <span>
                                                    {book.condition_status ||
                                                        "No condition"}
                                                </span>

                                            </div>


                                        </div>

                                    </div>

                                ))}

                        </div>
                    )}

            </div>

        </div>
    );
};

export default Dashboard;
