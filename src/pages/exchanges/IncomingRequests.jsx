import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../utils/api";

const IncomingRequests = () => {
    const { user } = useAuth();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [meetups, setMeetups] = useState({});
    const [meetupForms, setMeetupForms] = useState({});
    const [meetupLoading, setMeetupLoading] = useState({});
    const [meetupErrors, setMeetupErrors] = useState({});

    // Rating states
    const [ratings, setRatings] = useState({});
    const [ratingForms, setRatingForms] = useState({});
    const [ratingLoading, setRatingLoading] = useState({});
    const [ratingErrors, setRatingErrors] = useState({});

    // Confirmation modal
    const [confirmation, setConfirmation] = useState({
        show: false,
        title: "",
        message: "",
        type: "success",
    });

    // Show confirmation modal
    const showConfirmation = (
        title,
        message,
        type = "success"
    ) => {
        setConfirmation({
            show: true,
            title,
            message,
            type,
        });
    };

    // Close confirmation modal
    const closeConfirmation = () => {
        setConfirmation({
            show: false,
            title: "",
            message: "",
            type: "success",
        });
    };

    // Fetch incoming exchange requests
    const fetchIncomingRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/exchanges/incoming/${user.user_id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to retrieve incoming requests"
                );
            }

            setRequests(data.requests);

            // Fetch meetup details for accepted requests
            const acceptedRequests =
                data.requests.filter(
                    (request) =>
                        request.status === "Accepted"
                );

            const meetupResults = {};

            await Promise.all(
                acceptedRequests.map(
                    async (request) => {
                        try {
                            const meetupResponse =
                                await fetch(
                                    `${API_URL}/api/meetups/${request.request_id}`,
                                    {
                                        headers: {
                                            Authorization: `Bearer ${localStorage.getItem(
                                                "token"
                                            )}`,
                                        },
                                    }
                                );

                            if (meetupResponse.ok) {
                                const meetupData =
                                    await meetupResponse.json();

                                meetupResults[
                                    request.request_id
                                ] = meetupData;
                            }
                        } catch (error) {
                            console.error(
                                "Fetch meetup error:",
                                error
                            );
                        }
                    }
                )
            );

            setMeetups(meetupResults);

            // Fetch ratings for completed requests
            const completedRequests =
                data.requests.filter(
                    (request) =>
                        request.status === "Completed"
                );

            const ratingResults = {};

            await Promise.all(
                completedRequests.map(
                    async (request) => {
                        try {
                            const ratingResponse =
                                await fetch(
                                    `${API_URL}/api/ratings/exchange/${request.request_id}`,
                                    {
                                        headers: {
                                            Authorization: `Bearer ${localStorage.getItem(
                                                "token"
                                            )}`,
                                        },
                                    }
                                );

                            if (ratingResponse.ok) {
                                const ratingData =
                                    await ratingResponse.json();

                                ratingResults[
                                    request.request_id
                                ] = ratingData;
                            }
                        } catch (error) {
                            console.error(
                                "Fetch rating error:",
                                error
                            );
                        }
                    }
                )
            );

            setRatings(ratingResults);

        } catch (err) {
            console.error(
                "Fetch incoming requests error:",
                err
            );

            setError(err.message);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_id) {
            fetchIncomingRequests();
        }
    }, [user]);

    // Accept or reject an exchange request
    const updateRequest = async (
        requestId,
        status
    ) => {
        try {
            const response = await fetch(
                `${API_URL}/api/exchanges/${requestId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        status: status,
                        owner_id: user.user_id,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update exchange request"
                );
            }

            await fetchIncomingRequests();

            showConfirmation(
                status === "Accepted"
                    ? "Request Accepted"
                    : "Request Rejected",
                data.message ||
                    `The exchange request has been ${status.toLowerCase()}.`
            );

        } catch (err) {
            console.error(
                "Update request error:",
                err
            );

            showConfirmation(
                "Action Failed",
                err.message,
                "error"
            );
        }
    };

    // Start meetup form
    const startMeetupForm = (requestId) => {
        const existingMeetup =
            meetups[requestId];

        setMeetupForms((previous) => ({
            ...previous,
            [requestId]: {
                meetup_date:
                    existingMeetup?.meetup_date
                        ? existingMeetup.meetup_date
                              .toString()
                              .substring(0, 10)
                        : "",

                meetup_time:
                    existingMeetup?.meetup_time
                        ? existingMeetup.meetup_time
                              .toString()
                              .substring(0, 5)
                        : "",

                location:
                    existingMeetup?.location || "",

                notes:
                    existingMeetup?.notes || "",
            },
        }));

        setMeetupErrors((previous) => ({
            ...previous,
            [requestId]: "",
        }));
    };

    // Update meetup form fields
    const handleMeetupChange = (
        requestId,
        field,
        value
    ) => {
        setMeetupForms((previous) => ({
            ...previous,
            [requestId]: {
                ...previous[requestId],
                [field]: value,
            },
        }));
    };

    // Save meetup
    const saveMeetup = async (requestId) => {
        try {
            setMeetupLoading((previous) => ({
                ...previous,
                [requestId]: true,
            }));

            setMeetupErrors((previous) => ({
                ...previous,
                [requestId]: "",
            }));

            const form =
                meetupForms[requestId];

            if (
                !form?.meetup_date ||
                !form?.meetup_time ||
                !form?.location
            ) {
                throw new Error(
                    "Please enter the meetup date, time and location."
                );
            }

            const existingMeetup =
                meetups[requestId];

            const method = existingMeetup
                ? "PUT"
                : "POST";

            const response = await fetch(
                `${API_URL}/api/meetups/${requestId}`,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },

                    body: JSON.stringify({
                        meetup_date:
                            form.meetup_date,

                        meetup_time:
                            form.meetup_time,

                        location:
                            form.location,

                        notes:
                            form.notes,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save meetup details."
                );
            }

            // Get saved meetup
            const meetupResponse =
                await fetch(
                    `${API_URL}/api/meetups/${requestId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );

            const meetupData =
                await meetupResponse.json();

            if (meetupResponse.ok) {
                setMeetups((previous) => ({
                    ...previous,
                    [requestId]:
                        meetupData,
                }));
            }

            setMeetupForms((previous) => {
                const updated = {
                    ...previous,
                };

                delete updated[requestId];

                return updated;
            });

        } catch (err) {
            console.error(
                "Save meetup error:",
                err
            );

            setMeetupErrors((previous) => ({
                ...previous,
                [requestId]:
                    err.message,
            }));

        } finally {
            setMeetupLoading((previous) => ({
                ...previous,
                [requestId]: false,
            }));
        }
    };

    // Format meetup date
    const formatMeetupDate = (date) => {
        if (!date) {
            return "";
        }

        const dateString = date
            .toString()
            .substring(0, 10);

        const [year, month, day] =
            dateString.split("-");

        return `${day}/${month}/${year}`;
    };

    // Format meetup time
    const formatMeetupTime = (time) => {
        if (!time) {
            return "";
        }

        return time
            .toString()
            .substring(0, 5);
    };

    // Start rating form
    const startRatingForm = (
        requestId
    ) => {
        setRatingForms((previous) => ({
            ...previous,
            [requestId]: {
                rating: 0,
                review: "",
            },
        }));

        setRatingErrors((previous) => ({
            ...previous,
            [requestId]: "",
        }));
    };

    // Update rating form
    const handleRatingChange = (
        requestId,
        field,
        value
    ) => {
        setRatingForms((previous) => ({
            ...previous,
            [requestId]: {
                ...previous[requestId],
                [field]: value,
            },
        }));
    };

    // Submit rating
    const submitRating = async (
        requestId
    ) => {
        const form =
            ratingForms[requestId];

        if (!form) {
            return;
        }

        if (!form.rating) {
            setRatingErrors((previous) => ({
                ...previous,
                [requestId]:
                    "Please select a rating before submitting.",
            }));

            return;
        }

        try {
            setRatingLoading((previous) => ({
                ...previous,
                [requestId]: true,
            }));

            setRatingErrors((previous) => ({
                ...previous,
                [requestId]: "",
            }));

            const token =
                localStorage.getItem(
                    "token"
                );

            const response = await fetch(
                `${API_URL}/api/ratings`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        request_id:
                            requestId,

                        rating:
                            Number(
                                form.rating
                            ),

                        review:
                            form.review,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to submit rating."
                );
            }

            // Get submitted rating
            const ratingResponse =
                await fetch(
                    `${API_URL}/api/ratings/exchange/${requestId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            const ratingData =
                await ratingResponse.json();

            setRatings((previous) => ({
                ...previous,
                [requestId]:
                    ratingData,
            }));

            setRatingForms((previous) => {
                const updated = {
                    ...previous,
                };

                delete updated[requestId];

                return updated;
            });

            // Show centered confirmation
            showConfirmation(
                "Rating Submitted",
                "Your rating has been submitted successfully."
            );

        } catch (err) {
            console.error(
                "Submit rating error:",
                err
            );

            setRatingErrors((previous) => ({
                ...previous,
                [requestId]:
                    err.message,
            }));

        } finally {
            setRatingLoading((previous) => ({
                ...previous,
                [requestId]: false,
            }));
        }
    };

    // Summary counts
    const totalRequests =
        requests.length;

    const pendingRequests =
        requests.filter(
            (request) =>
                request.status ===
                "Pending"
        ).length;

    const acceptedRequests =
        requests.filter(
            (request) =>
                request.status ===
                "Accepted"
        ).length;

    const rejectedRequests =
        requests.filter(
            (request) =>
                request.status ===
                "Rejected"
        ).length;

    return (
        <div className="page-container">

            {/* Confirmation Modal */}
            {confirmation.show && (
                <div className="confirmation-overlay">

                    <div className="confirmation-modal">

                        <div
                            className={`confirmation-icon ${
                                confirmation.type ===
                                "error"
                                    ? "confirmation-error"
                                    : "confirmation-success"
                            }`}
                        >
                            {confirmation.type ===
                            "error"
                                ? "✕"
                                : "✓"}
                        </div>

                        <h2>
                            {confirmation.title}
                        </h2>

                        <p>
                            {confirmation.message}
                        </p>

                        <button
                            className="primary-button confirmation-button"
                            onClick={
                                closeConfirmation
                            }
                        >
                            OK
                        </button>

                    </div>

                </div>
            )}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>
                        Incoming Requests
                    </h1>

                    <p>
                        Review and manage exchange
                        requests for your books.
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="request-summary">

                <div className="request-summary-card">
                    <div>
                        <span>
                            Total Requests
                        </span>

                        <strong>
                            {totalRequests}
                        </strong>
                    </div>
                </div>

                <div className="request-summary-card">
                    <div>
                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingRequests}
                        </strong>
                    </div>
                </div>

                <div className="request-summary-card">
                    <div>
                        <span>
                            Accepted
                        </span>

                        <strong>
                            {acceptedRequests}
                        </strong>
                    </div>
                </div>

                <div className="request-summary-card">
                    <div>
                        <span>
                            Rejected
                        </span>

                        <strong>
                            {rejectedRequests}
                        </strong>
                    </div>
                </div>

            </div>

            {/* Loading State */}
            {loading && (
                <div className="empty-state">
                    <div className="empty-icon">
                        ⏳
                    </div>

                    <h3>
                        Loading Requests
                    </h3>

                    <p>
                        Please wait while we retrieve
                        your incoming requests.
                    </p>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="empty-state">
                    <div className="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to Load Requests
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        className="primary-button"
                        onClick={
                            fetchIncomingRequests
                        }
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading &&
                !error &&
                requests.length === 0 && (
                    <div className="empty-state">

                        <h3>
                            No Incoming Requests
                        </h3>

                        <p>
                            You don't have any exchange
                            requests for your books yet.
                        </p>

                    </div>
                )}

            {/* Requests List */}
            {!loading &&
                !error &&
                requests.length > 0 && (
                    <div className="requests-list">

                        {requests.map(
                            (request) => {

                                const meetup =
                                    meetups[
                                        request.request_id
                                    ];

                                const meetupForm =
                                    meetupForms[
                                        request.request_id
                                    ];

                                const meetupError =
                                    meetupErrors[
                                        request.request_id
                                    ];

                                const isMeetupLoading =
                                    meetupLoading[
                                        request.request_id
                                    ];

                                const rating =
                                    ratings[
                                        request.request_id
                                    ];

                                const ratingForm =
                                    ratingForms[
                                        request.request_id
                                    ];

                                const ratingError =
                                    ratingErrors[
                                        request.request_id
                                    ];

                                const isRatingLoading =
                                    ratingLoading[
                                        request.request_id
                                    ];

                                return (
                                    <div
                                        className="request-card"
                                        key={
                                            request.request_id
                                        }
                                    >

{/* COVER */}
<div className="request-book-icon">

    {request.cover_image ? (

        <img
            src={request.cover_image}
            alt={`${request.title} cover`}
            className="request-book-cover-image"
        />

    ) : (

        "📖"

    )}

</div>

                                        {/* Request Information */}
                                        <div className="request-card-main">

                                            {/* Header */}
                                            <div className="request-card-header">

                                                <div>
                                                    <h3>
                                                        {
                                                            request.title
                                                        }
                                                    </h3>

                                                    <p>
                                                        by{" "}
                                                        {
                                                            request.author
                                                        }
                                                    </p>
                                                </div>

                                                <span
                                                    className={`request-status ${
                                                        request.status ===
                                                        "Pending"
                                                            ? "request-pending"
                                                            : request.status ===
                                                              "Accepted"
                                                            ? "request-accepted"
                                                            : request.status ===
                                                              "Completed"
                                                            ? "request-accepted"
                                                            : "request-rejected"
                                                    }`}
                                                >
                                                    {
                                                        request.status
                                                    }
                                                </span>

                                            </div>

                                            {/* Details */}
                                            <div className="request-details">

                                                <div>
                                                    <span>
                                                        Requested By
                                                    </span>

                                                    <strong>
                                                        {
                                                            request.requester_name
                                                        }
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Email
                                                    </span>

                                                    <strong>
                                                        {
                                                            request.requester_email
                                                        }
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Request Date
                                                    </span>

                                                    <strong>
                                                        {new Date(
                                                            request.request_date
                                                        ).toLocaleString()}
                                                    </strong>
                                                </div>

                                            </div>

                                            {/* Pending Actions */}
                                            {request.status ===
                                                "Pending" && (
                                                <div className="request-actions">

                                                    <button
                                                        className="success-button"
                                                        onClick={() =>
                                                            updateRequest(
                                                                request.request_id,
                                                                "Accepted"
                                                            )
                                                        }
                                                    >
                                                        ✓ Accept Request
                                                    </button>

                                                    <button
                                                        className="danger-button"
                                                        onClick={() =>
                                                            updateRequest(
                                                                request.request_id,
                                                                "Rejected"
                                                            )
                                                        }
                                                    >
                                                        ✕ Reject Request
                                                    </button>

                                                </div>
                                            )}

                                            {/* Accepted Notice */}
                                            {request.status ===
                                                "Accepted" && (
                                                <div className="accepted-notice">
                                                    ✓ This exchange
                                                    request has been
                                                    accepted.
                                                </div>
                                            )}

                                            {/* Completed Notice */}
                                            {request.status ===
                                                "Completed" && (
                                                <div className="accepted-notice">
                                                    ✓ This exchange
                                                    has been completed.
                                                </div>
                                            )}

                                            {/* Owner Meetup Section */}
                                            {request.status ===
                                                "Accepted" && (
                                                <div className="meetup-section">

                                                    {!meetup &&
                                                        !meetupForm && (
                                                            <div>

                                                                <div className="meetup-header">
                                                                    <div>
                                                                        <h3>
                                                                            Meetup Arrangement
                                                                        </h3>

                                                                        <p>
                                                                            Arrange a date,
                                                                            time and location
                                                                            for the book
                                                                            exchange.
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    className="meetup-button"
                                                                    onClick={() =>
                                                                        startMeetupForm(
                                                                            request.request_id
                                                                        )
                                                                    }
                                                                >
                                                                    Arrange Meetup
                                                                </button>

                                                            </div>
                                                        )}

                                                    {meetup &&
                                                        !meetupForm && (
                                                            <div className="meetup-details">

                                                                <div className="meetup-header">
                                                                    <div>
                                                                        <h3>
                                                                            Meetup Details
                                                                        </h3>

                                                                        <p>
                                                                            Current arrangement
                                                                            for this exchange.
                                                                        </p>
                                                                    </div>

                                                                    <button
                                                                        className="meetup-edit-button"
                                                                        onClick={() =>
                                                                            startMeetupForm(
                                                                                request.request_id
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit Meetup
                                                                    </button>
                                                                </div>

                                                                <div className="meetup-info-grid">

                                                                    <div>
                                                                        <span>
                                                                            Date
                                                                        </span>

                                                                        <strong>
                                                                            {formatMeetupDate(
                                                                                meetup.meetup_date
                                                                            )}
                                                                        </strong>
                                                                    </div>

                                                                    <div>
                                                                        <span>
                                                                            Time
                                                                        </span>

                                                                        <strong>
                                                                            {formatMeetupTime(
                                                                                meetup.meetup_time
                                                                            )}
                                                                        </strong>
                                                                    </div>

                                                                    <div>
                                                                        <span>
                                                                            Location
                                                                        </span>

                                                                        <strong>
                                                                            {
                                                                                meetup.location
                                                                            }
                                                                        </strong>
                                                                    </div>

                                                                </div>

                                                                {meetup.notes && (
                                                                    <div className="meetup-notes">

                                                                        <span>
                                                                            Notes
                                                                        </span>

                                                                        <p>
                                                                            {
                                                                                meetup.notes
                                                                            }
                                                                        </p>

                                                                    </div>
                                                                )}

                                                            </div>
                                                        )}

                                                    {meetupForm && (
                                                        <div className="meetup-form">

                                                            <div className="meetup-form-header">

                                                                <div>
                                                                    <h3>
                                                                        {meetup
                                                                            ? "Edit Meetup"
                                                                            : "Arrange Meetup"}
                                                                    </h3>

                                                                    <p>
                                                                        Enter the meetup
                                                                        details for this
                                                                        exchange.
                                                                    </p>
                                                                </div>

                                                            </div>

                                                            <div className="meetup-form-grid">

                                                                <div className="meetup-field">
                                                                    <label>
                                                                        Date
                                                                    </label>

                                                                    <input
                                                                        type="date"
                                                                        value={
                                                                            meetupForm.meetup_date
                                                                        }
                                                                        onChange={(e) =>
                                                                            handleMeetupChange(
                                                                                request.request_id,
                                                                                "meetup_date",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="meetup-field">
                                                                    <label>
                                                                        Time
                                                                    </label>

                                                                    <input
                                                                        type="time"
                                                                        value={
                                                                            meetupForm.meetup_time
                                                                        }
                                                                        onChange={(e) =>
                                                                            handleMeetupChange(
                                                                                request.request_id,
                                                                                "meetup_time",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                            </div>

                                                            <div className="meetup-field">
                                                                <label>
                                                                    Location
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter meetup location"
                                                                    value={
                                                                        meetupForm.location
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleMeetupChange(
                                                                            request.request_id,
                                                                            "location",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="meetup-field">
                                                                <label>
                                                                    Notes
                                                                </label>

                                                                <textarea
                                                                    rows="3"
                                                                    placeholder="Optional notes for the meetup"
                                                                    value={
                                                                        meetupForm.notes
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleMeetupChange(
                                                                            request.request_id,
                                                                            "notes",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            {meetupError && (
                                                                <div className="meetup-error">
                                                                    {
                                                                        meetupError
                                                                    }
                                                                </div>
                                                            )}

                                                            <div className="meetup-form-actions">

                                                                <button
                                                                    className="meetup-cancel-button"
                                                                    onClick={() =>
                                                                        setMeetupForms(
                                                                            (
                                                                                previous
                                                                            ) => {
                                                                                const updated =
                                                                                    {
                                                                                        ...previous,
                                                                                    };

                                                                                delete updated[
                                                                                    request.request_id
                                                                                ];

                                                                                return updated;
                                                                            }
                                                                        )
                                                                    }
                                                                >
                                                                    Cancel
                                                                </button>

                                                                <button
                                                                    className="meetup-save-button"
                                                                    disabled={
                                                                        isMeetupLoading
                                                                    }
                                                                    onClick={() =>
                                                                        saveMeetup(
                                                                            request.request_id
                                                                        )
                                                                    }
                                                                >
                                                                    {isMeetupLoading
                                                                        ? "Saving..."
                                                                        : meetup
                                                                        ? "Update Meetup"
                                                                        : "Save Meetup"}
                                                                </button>

                                                            </div>

                                                        </div>
                                                    )}

                                                </div>
                                            )}

                                            {/* Owner Rating Section */}
                                            {request.status ===
                                                "Completed" && (
                                                <div className="rating-section">

                                                    {!rating?.rated &&
                                                        !ratingForm && (
                                                            <div className="rating-start">

                                                                <div>
                                                                    <h3>
                                                                        ⭐ Rate the Requester
                                                                    </h3>

                                                                    <p>
                                                                        Share your experience
                                                                        with{" "}
                                                                        {
                                                                            request.requester_name
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    className="rating-button"
                                                                    onClick={() =>
                                                                        startRatingForm(
                                                                            request.request_id
                                                                        )
                                                                    }
                                                                >
                                                                    Rate User
                                                                </button>

                                                            </div>
                                                        )}

                                                    {ratingForm && (
                                                        <div className="rating-form">

                                                            <div className="rating-form-header">

                                                                <div>
                                                                    <h3>
                                                                        ⭐ Rate{" "}
                                                                        {
                                                                            request.requester_name
                                                                        }
                                                                    </h3>

                                                                    <p>
                                                                        How was your
                                                                        exchange
                                                                        experience?
                                                                    </p>
                                                                </div>

                                                            </div>

                                                            {ratingError && (
                                                                <div className="rating-error">
                                                                    {
                                                                        ratingError
                                                                    }
                                                                </div>
                                                            )}

                                                            <div className="star-rating">

                                                                {[1, 2, 3, 4, 5].map(
                                                                    (star) => (
                                                                        <button
                                                                            key={
                                                                                star
                                                                            }
                                                                            type="button"
                                                                            className={`star ${
                                                                                star <=
                                                                                ratingForm.rating
                                                                                    ? "active"
                                                                                    : ""
                                                                            }`}
                                                                            onClick={() =>
                                                                                handleRatingChange(
                                                                                    request.request_id,
                                                                                    "rating",
                                                                                    star
                                                                                )
                                                                            }
                                                                        >
                                                                            ★
                                                                        </button>
                                                                    )
                                                                )}

                                                            </div>

                                                            <div className="rating-field">

                                                                <label>
                                                                    Review{" "}
                                                                    <span>
                                                                        (Optional)
                                                                    </span>
                                                                </label>

                                                                <textarea
                                                                    rows="4"
                                                                    placeholder="Write a short review about your exchange experience..."
                                                                    value={
                                                                        ratingForm.review
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleRatingChange(
                                                                            request.request_id,
                                                                            "review",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />

                                                            </div>

                                                            <div className="rating-form-actions">

                                                                <button
                                                                    type="button"
                                                                    className="rating-cancel-button"
                                                                    onClick={() =>
                                                                        setRatingForms(
                                                                            (
                                                                                previous
                                                                            ) => {
                                                                                const updated =
                                                                                    {
                                                                                        ...previous,
                                                                                    };

                                                                                delete updated[
                                                                                    request.request_id
                                                                                ];

                                                                                return updated;
                                                                            }
                                                                        )
                                                                    }
                                                                >
                                                                    Cancel
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="rating-submit-button"
                                                                    disabled={
                                                                        isRatingLoading
                                                                    }
                                                                    onClick={() =>
                                                                        submitRating(
                                                                            request.request_id
                                                                        )
                                                                    }
                                                                >
                                                                    {isRatingLoading
                                                                        ? "Submitting..."
                                                                        : "Submit Rating"}
                                                                </button>

                                                            </div>

                                                        </div>
                                                    )}

                                                    {rating?.rated && (
                                                        <div className="rating-submitted">

                                                            <div className="rating-submitted-header">

                                                                <div>
                                                                    <h3>
                                                                        ⭐ Your Rating
                                                                    </h3>

                                                                    <p>
                                                                        You rated{" "}
                                                                        {
                                                                            rating
                                                                                .rating
                                                                                ?.rated_user_name
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <span className="rating-complete-label">
                                                                    Rated ✓
                                                                </span>

                                                            </div>

                                                            <div className="submitted-stars">

                                                                {[1, 2, 3, 4, 5].map(
                                                                    (star) => (
                                                                        <span
                                                                            key={
                                                                                star
                                                                            }
                                                                            className={`submitted-star ${
                                                                                star <=
                                                                                rating
                                                                                    .rating
                                                                                    ?.rating
                                                                                    ? "active"
                                                                                    : ""
                                                                            }`}
                                                                        >
                                                                            ★
                                                                        </span>
                                                                    )
                                                                )}

                                                            </div>

                                                            {rating.rating?.review && (
                                                                <div className="submitted-review">

                                                                    <span>
                                                                        Your Review
                                                                    </span>

                                                                    <p>
                                                                        {
                                                                            rating
                                                                                .rating
                                                                                .review
                                                                        }
                                                                    </p>

                                                                </div>
                                                            )}

                                                        </div>
                                                    )}

                                                </div>
                                            )}

                                            {/* Rejected Notice */}
                                            {request.status ===
                                                "Rejected" && (
                                                <div className="rejected-notice">
                                                    ✕ This exchange
                                                    request has been
                                                    rejected.
                                                </div>
                                            )}

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

        </div>
    );
};

export default IncomingRequests;