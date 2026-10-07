import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../utils/api";

const BookPreview = ({
    book,
    onClose,
    onRequestExchange
}) => {
    const { user } = useAuth();

    const [showReportForm, setShowReportForm] =
        useState(false);

    const [reportReason, setReportReason] =
        useState("");

    const [reportDescription, setReportDescription] =
        useState("");

    const [reportLoading, setReportLoading] =
        useState(false);

    const [reportError, setReportError] =
        useState("");

    const [reportSuccess, setReportSuccess] =
        useState(false);

    if (!book) {
        return null;
    }

    const handleSubmitReport = async (e) => {
        e.preventDefault();

        setReportError("");

        if (!reportReason) {
            setReportError(
                "Please select a reason for the report."
            );
            return;
        }

        try {
            setReportLoading(true);

            const response = await fetch(
                `${API_URL}/api/reports`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reporter_id: user.user_id,
                        reported_user_id: book.user_id,
                        book_id: book.book_id,
                        reason: reportReason,
                        description:
                            reportDescription.trim() ||
                            null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to submit report."
                );
            }

            setReportSuccess(true);
            setReportReason("");
            setReportDescription("");

        } catch (error) {
            setReportError(error.message);

        } finally {
            setReportLoading(false);
        }
    };

    const closeReportForm = () => {
        setShowReportForm(false);
        setReportError("");
        setReportReason("");
        setReportDescription("");
        setReportSuccess(false);
    };

    return (
        <div
            className="book-preview-overlay"
            onClick={onClose}
        >
            <div
                className="book-preview-modal"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                {/* HEADER */}
                <div className="book-preview-header">
                    <div>
                        <h2>Book Details</h2>

                        <p>
                            View information about this book.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="book-preview-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {/* BOOK INFORMATION */}
                <div className="book-preview-content">

                    {/* COVER */}
                    <div className="book-preview-cover">
                        {book.cover_image ? (
                    <img
                        src={book.cover_image}
                        alt={`${book.title} cover`}
                        loading="eager"
                    />
                        ) : (       
                            <div className="book-preview-cover-placeholder">
                                <span>📖</span>

                                <p>
                                    No cover available
                                </p>
                            </div>
                        )}
                    </div>

                    {/* DETAILS */}
                    <div className="book-preview-details">

                        <div className="book-preview-status">
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

                        <h1>{book.title}</h1>

                        <p className="book-preview-author">
                            by {book.author}
                        </p>

                        <div className="book-preview-info-grid">

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

                            <div>
                                <span>Status</span>

                                <strong>
                                    {book.status ||
                                        "Not specified"}
                                </strong>
                            </div>

                        </div>

                        {/* DESCRIPTION */}
                        <div className="book-preview-description">

                            <h3>Description</h3>

                            <p>
                                {book.description ||
                                    "No description available."}
                            </p>

                        </div>

                        {/* OWNER */}
                        <div className="book-preview-owner">

                            <h3>Owner</h3>

                            <div className="book-preview-owner-card">

                                <div className="book-preview-owner-icon">
                                    👤
                                </div>

                                <div>
                                    <strong>
                                        {book.owner_name ||
                                            "Unknown owner"}
                                    </strong>

                                    <p>
                                        Book owner
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>

                {/* ACTIONS */}
                <div className="book-preview-actions">

                    {user &&
                        user.user_id !==
                            book.user_id && (
                            <button
                                type="button"
                                className="primary-button"
                                onClick={() => {
                                    if (
                                        onRequestExchange
                                    ) {
                                        onRequestExchange(
                                            book
                                        );
                                    }
                                }}
                            >
                                Request Exchange
                            </button>
                        )}

                    {user &&
                        user.user_id !==
                            book.user_id && (
                            <button
                                type="button"
                                className="report-owner-button"
                                onClick={() => {
                                    setShowReportForm(
                                        true
                                    );
                                    setReportSuccess(
                                        false
                                    );
                                    setReportError("");
                                }}
                            >
                                ⚠ Report Owner
                            </button>
                        )}

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                    >
                        Close
                    </button>

                </div>

                {/* REPORT FORM */}
                {showReportForm && (
                    <div
                        className="report-preview-overlay"
                        onClick={closeReportForm}
                    >
                        <div
                            className="report-preview-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            {!reportSuccess ? (
                                <>
                                    <h2>
                                        Report Owner
                                    </h2>

                                    <p>
                                        Please provide a
                                        reason for reporting
                                        this book owner.
                                    </p>

                                    <form
                                        onSubmit={
                                            handleSubmitReport
                                        }
                                    >

                                        <div className="report-form-field">

                                            <label>
                                                Reason
                                            </label>

                                            <select
                                                value={
                                                    reportReason
                                                }
                                                onChange={(e) =>
                                                    setReportReason(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select a reason
                                                </option>

                                                <option value="Inappropriate book/content">
                                                    Inappropriate
                                                    book/content
                                                </option>

                                                <option value="Offensive or harmful content">
                                                    Offensive or
                                                    harmful content
                                                </option>

                                                <option value="Misleading book information">
                                                    Misleading book
                                                    information
                                                </option>

                                                <option value="Suspicious or prohibited content">
                                                    Suspicious or
                                                    prohibited content
                                                </option>

                                                <option value="Other">
                                                    Other
                                                </option>
                                            </select>

                                        </div>

                                        <div className="report-form-field">

                                            <label>
                                                Description
                                            </label>

                                            <textarea
                                                rows="5"
                                                placeholder="Please provide additional details..."
                                                value={
                                                    reportDescription
                                                }
                                                onChange={(e) =>
                                                    setReportDescription(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                            />

                                        </div>

                                        {reportError && (
                                            <p className="report-form-error">
                                                {reportError}
                                            </p>
                                        )}

                                        <div className="report-form-actions">

                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={
                                                    closeReportForm
                                                }
                                                disabled={
                                                    reportLoading
                                                }
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="primary-button"
                                                disabled={
                                                    reportLoading
                                                }
                                            >
                                                {reportLoading
                                                    ? "Submitting..."
                                                    : "Submit Report"}
                                            </button>

                                        </div>

                                    </form>
                                </>
                            ) : (
                                <div className="report-success-content">

                                    <div className="success-modal-icon">
                                        ✓
                                    </div>

                                    <h2>
                                        Report Submitted
                                    </h2>

                                    <p>
                                        Your report has been
                                        submitted successfully.
                                        An administrator will
                                        review it.
                                    </p>

                                    <button
                                        type="button"
                                        className="primary-button"
                                        onClick={
                                            closeReportForm
                                        }
                                    >
                                        Done
                                    </button>

                                </div>
                            )}

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BookPreview;