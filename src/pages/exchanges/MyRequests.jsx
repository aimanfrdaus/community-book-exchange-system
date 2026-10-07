import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../utils/api";

const MyRequests = () => {
    const { user } = useAuth();

    const [requests, setRequests] = useState([]);
    const [meetups, setMeetups] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [meetupForms, setMeetupForms] = useState({});
    const [meetupLoading, setMeetupLoading] = useState({});
    const [meetupErrors, setMeetupErrors] = useState({});

    // Rating states
    const [ratings, setRatings] = useState({});
    const [ratingForms, setRatingForms] = useState({});
    const [ratingLoading, setRatingLoading] = useState({});
    const [ratingErrors, setRatingErrors] = useState({});

   const [confirmation, setConfirmation] = useState({
    show: false,
    title: "",
    message: "",
    type: "",
    requestId: null,
});

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/exchanges/my-requests/${user.user_id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to retrieve exchange requests"
                );
            }

            setRequests(data.requests);

            // Load meetup details for accepted exchanges
            const acceptedRequests = data.requests.filter(
                (request) => request.status === "Accepted"
            );

            const meetupResults = {};

            for (const request of acceptedRequests) {
                try {
                    const token = localStorage.getItem("token");

                    const meetupResponse = await fetch(
                        `${API_URL}/api/meetups/${request.request_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    if (meetupResponse.ok) {
                        const meetupData =
                            await meetupResponse.json();

                        meetupResults[request.request_id] =
                            meetupData;
                    }
                } catch (error) {
                    console.error(
                        "Get meetup error:",
                        error
                    );
                }
            }

            setMeetups(meetupResults);

            // Load rating details for completed exchanges
            const completedRequests = data.requests.filter(
                (request) => request.status === "Completed"
            );

            const ratingResults = {};

            for (const request of completedRequests) {
                try {
                    const token = localStorage.getItem("token");

                    const ratingResponse = await fetch(
                        `${API_URL}/api/ratings/exchange/${request.request_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    if (ratingResponse.ok) {
                        const ratingData =
                            await ratingResponse.json();

                        ratingResults[request.request_id] =
                            ratingData;
                    }
                } catch (error) {
                    console.error(
                        "Get rating error:",
                        error
                    );
                }
            }

            setRatings(ratingResults);

        } catch (err) {
            setError(err.message);

            console.error(
                "Get my requests error:",
                err
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (user?.user_id) {
            fetchMyRequests();
        }
    }, [user]);


const completeExchange = (requestId) => {
    setConfirmation({
        show: true,
        title: "Mark as Completed",
        message:
            "Are you sure you want to mark this exchange as completed?",
        type: "complete",
        requestId: requestId,
    });
};


    // ==============================
    // MEETUP FUNCTIONS
    // ==============================

    const handleMeetupChange = (
        requestId,
        field,
        value
    ) => {
        setMeetupForms((current) => ({
            ...current,
            [requestId]: {
                ...current[requestId],
                [field]: value
            }
        }));
    };


    const startMeetupForm = (requestId) => {
        const existingMeetup = meetups[requestId];

        if (existingMeetup) {
            setMeetupForms((current) => ({
                ...current,
                [requestId]: {
                    meetup_date:
                        existingMeetup.meetup_date
                            ? existingMeetup.meetup_date
                                .toString()
                                .substring(0, 10)
                            : "",
                    meetup_time:
                        existingMeetup.meetup_time
                            ? existingMeetup.meetup_time
                                .toString()
                                .substring(0, 5)
                            : "",
                    location:
                        existingMeetup.location || "",
                    notes:
                        existingMeetup.notes || ""
                }
            }));
        } else {
            setMeetupForms((current) => ({
                ...current,
                [requestId]: {
                    meetup_date: "",
                    meetup_time: "",
                    location: "",
                    notes: ""
                }
            }));
        }

        setMeetupErrors((current) => ({
            ...current,
            [requestId]: ""
        }));
    };


    const saveMeetup = async (requestId) => {
        const form = meetupForms[requestId];

        if (!form) {
            return;
        }

        if (
            !form.meetup_date ||
            !form.meetup_time ||
            !form.location
        ) {
            setMeetupErrors((current) => ({
                ...current,
                [requestId]:
                    "Please enter the meetup date, time and location."
            }));

            return;
        }

        try {
            setMeetupLoading((current) => ({
                ...current,
                [requestId]: true
            }));

            setMeetupErrors((current) => ({
                ...current,
                [requestId]: ""
            }));

            const token = localStorage.getItem("token");

            const existingMeetup = meetups[requestId];

            const response = await fetch(
                `${API_URL}/api/meetups/${requestId}`,
                {
                    method: existingMeetup
                        ? "PUT"
                        : "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        meetup_date: form.meetup_date,
                        meetup_time: form.meetup_time,
                        location: form.location,
                        notes: form.notes
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to save meetup details."
                );
            }

            const meetupResponse = await fetch(
                `${API_URL}/api/meetups/${requestId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const meetupData =
                await meetupResponse.json();

            setMeetups((current) => ({
                ...current,
                [requestId]: meetupData
            }));

            setMeetupForms((current) => ({
                ...current,
                [requestId]: undefined
            }));

        } catch (err) {
            setMeetupErrors((current) => ({
                ...current,
                [requestId]: err.message
            }));

            console.error(
                "Save meetup error:",
                err
            );
        } finally {
            setMeetupLoading((current) => ({
                ...current,
                [requestId]: false
            }));
        }
    };


    // ==============================
    // RATING FUNCTIONS
    // ==============================

    const startRatingForm = (requestId) => {
        setRatingForms((current) => ({
            ...current,
            [requestId]: {
                rating: 0,
                review: ""
            }
        }));

        setRatingErrors((current) => ({
            ...current,
            [requestId]: ""
        }));
    };


    const handleRatingChange = (
        requestId,
        field,
        value
    ) => {
        setRatingForms((current) => ({
            ...current,
            [requestId]: {
                ...current[requestId],
                [field]: value
            }
        }));
    };

const showConfirmation = (title, message) => {
    setConfirmation({
        show: true,
        title: title,
        message: message,
        type: "message",
        requestId: null,
    });
};

const closeConfirmation = () => {
    setConfirmation({
        show: false,
        title: "",
        message: "",
        type: "",
        requestId: null,
    });
};

const confirmCompleteExchange = async () => {
    const requestId = confirmation.requestId;

    setConfirmation({
        show: false,
        title: "",
        message: "",
        type: "",
        requestId: null,
    });

    try {
        const response = await fetch(
            `${API_URL}/api/exchanges/${requestId}/complete`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user.user_id
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to complete exchange"
            );
        }

        showConfirmation(
            "Exchange Completed",
            data.message ||
            "The exchange has been marked as completed."
        );

        await fetchMyRequests();

    } catch (err) {
        console.error(
            "Complete exchange error:",
            err
        );

        showConfirmation(
            "Error",
            err.message
        );
    }
};

    const submitRating = async (requestId) => {
        const form = ratingForms[requestId];

        if (!form) {
            return;
        }

        if (!form.rating) {
            setRatingErrors((current) => ({
                ...current,
                [requestId]:
                    "Please select a rating before submitting."
            }));

            return;
        }

        try {
            setRatingLoading((current) => ({
                ...current,
                [requestId]: true
            }));

            setRatingErrors((current) => ({
                ...current,
                [requestId]: ""
            }));

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/ratings`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        request_id: requestId,
                        rating: Number(form.rating),
                        review: form.review
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to submit rating."
                );
            }

            // Fetch the rating again
            const ratingResponse = await fetch(
                `${API_URL}/api/ratings/exchange/${requestId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const ratingData =
                await ratingResponse.json();

            setRatings((current) => ({
                ...current,
                [requestId]: ratingData
            }));

            setRatingForms((current) => ({
                ...current,
                [requestId]: undefined
            }));

  showConfirmation(
    "Rating Submitted",
    "Your rating has been submitted successfully."
);

        } catch (err) {
            setRatingErrors((current) => ({
                ...current,
                [requestId]: err.message
            }));

            console.error(
                "Submit rating error:",
                err
            );
        } finally {
            setRatingLoading((current) => ({
                ...current,
                [requestId]: false
            }));
        }
    };


    const getStatusClass = (status) => {
        if (status === "Accepted") {
            return "request-accepted";
        }

        if (status === "Rejected") {
            return "request-rejected";
        }

        if (status === "Completed") {
            return "request-completed";
        }

        return "request-pending";
    };


    const formatMeetupDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(
            `${date.toString().substring(0, 10)}T00:00:00`
        ).toLocaleDateString();
    };


    const formatMeetupTime = (time) => {
        if (!time) {
            return "";
        }

        const timeString =
            time.toString().substring(0, 5);

        const [hours, minutes] =
            timeString.split(":");

        const date = new Date();

        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );

        return date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
    };


return (
    <div>

{/* Confirmation Modal */}
{confirmation.show && (
    <div className="confirmation-overlay">

        <div className="confirmation-modal">

            <div
                className={
                    confirmation.type === "complete"
                        ? "confirmation-icon confirmation-warning"
                        : "confirmation-icon confirmation-success"
                }
            >
                {confirmation.type === "complete"
                    ? "?"
                    : "✓"}
            </div>

            <h2>
                {confirmation.title}
            </h2>

            <p>
                {confirmation.message}
            </p>

            {confirmation.type === "complete" ? (

                <div className="confirmation-actions">

                    <button
                        className="secondary-button"
                        onClick={closeConfirmation}
                    >
                        Cancel
                    </button>

                    <button
                        className="primary-button"
                        onClick={confirmCompleteExchange}
                    >
                        Confirm
                    </button>

                </div>

            ) : (

                <button
                    className="primary-button confirmation-button"
                    onClick={closeConfirmation}
                >
                    OK
                </button>

            )}

        </div>

    </div>
)}


            {/* Page Header */}
            <div className="page-header">

                <div>
                    <h1>My Exchange Requests</h1>

                    <p>
                        Track the exchange requests you have sent
                        to other community members.
                    </p>
                </div>

            </div>


            {/* Summary */}
            {!loading &&
                !error &&
                requests.length > 0 && (

                    <div className="request-summary">

                        <div className="request-summary-card is-total">
                            <span>Total Requests</span>

                            <strong>
                                {requests.length}
                            </strong>
                        </div>

                        <div className="request-summary-card is-pending">
                            <span>Pending</span>

                            <strong>
                                {
                                    requests.filter(
                                        (request) =>
                                            request.status ===
                                            "Pending"
                                    ).length
                                }
                            </strong>
                        </div>

                        <div className="request-summary-card is-approved">
                            <span>Accepted</span>

                            <strong>
                                {
                                    requests.filter(
                                        (request) =>
                                            request.status ===
                                            "Accepted"
                                    ).length
                                }
                            </strong>
                        </div>

                        <div className="request-summary-card is-completed">
                            <span>Completed</span>

                            <strong>
                                {
                                    requests.filter(
                                        (request) =>
                                            request.status ===
                                            "Completed"
                                    ).length
                                }
                            </strong>
                            
                        </div>

                    </div>
                )}


            {/* Loading */}
            {loading && (
                <div className="empty-state">
                    <p>
                        Loading exchange requests...
                    </p>
                </div>
            )}


            {/* Error */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* Empty */}
            {!loading &&
                !error &&
                requests.length === 0 && (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📤
                        </div>

                        <h3>
                            No exchange requests yet
                        </h3>

                        <p>
                            When you request a book from
                            another community member, your
                            request will appear here.
                        </p>

                    </div>
                )}


            {/* Requests */}
            {!loading &&
                !error &&
                requests.length > 0 && (

                    <div className="requests-list">

                        {requests.map((request) => {

                            const meetup =
                                meetups[
                                    request.request_id
                                ];

                            const form =
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

                            const ratingData =
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
                                    key={request.request_id}
                                >

{/* COVER */}
<div className="request-book-icon">

    {request.cover_image ? (

        <img
            src={`${API_URL}/uploads/${request.cover_image}`}
            alt={`${request.title} cover`}
            className="request-book-cover-image"
        />

    ) : (

        "📖"

    )}

</div>


                                    {/* Main Information */}
                                    <div className="request-card-main">

                                        <div className="request-card-header">

                                            <div>
                                                <h2>
                                                    {request.title}
                                                </h2>

                                                <p>
                                                    by{" "}
                                                    {request.author}
                                                </p>
                                            </div>

                                            <span
                                                className={`request-status ${getStatusClass(
                                                    request.status
                                                )}`}
                                            >
                                                {request.status}
                                            </span>

                                        </div>


                                        <div className="request-details">
                                            

                                            <div>
                                                <span>
                                                    Book Owner
                                                </span>

                                                <strong>
                                                    {request.owner_name}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Location
                                                </span>

                                                <strong>
                                                    {request.location ||
                                                        "Not specified"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Request Date
                                                </span>

                                                <strong>
                                                    {new Date(
                                                        request.request_date
                                                    ).toLocaleDateString()}
                                                </strong>
                                            </div>

                                        </div>


                                        {/* Accepted */}
                                        {request.status ===
                                            "Accepted" && (

                                            <div className="accepted-notice-01">

                                                <strong>
                                                    Exchange accepted
                                                </strong>

                                                <p>
                                                    Arrange the meetup
                                                    with the book owner
                                                    before completing
                                                    the exchange.
                                                </p>

                                            </div>
                                        )}


                                        {/* Meetup */}
                                        {request.status ===
                                            "Accepted" && (

                                            <div className="meetup-section">

                                                {!meetup &&
                                                    !form && (

                                                        <button
                                                            className="meetup-button"
                                                            onClick={() =>
                                                                startMeetupForm(
                                                                    request.request_id
                                                                )
                                                            }
                                                        >
                                                            📅 Arrange Meetup
                                                        </button>
                                                    )}

                                                {meetup &&
                                                    !form && (

                                                        <div className="meetup-details">

                                                            <div className="meetup-header">

                                                                <div>
                                                                    <h3>
                                                                        📅 Meetup Details
                                                                    </h3>

                                                                    <p>
                                                                        Your meetup has been arranged.
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
                                                                    Edit
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
                                                                        {meetup.location}
                                                                    </strong>
                                                                </div>

                                                            </div>


                                                            {meetup.notes && (
                                                                <div className="meetup-notes">

                                                                    <span>
                                                                        Notes
                                                                    </span>

                                                                    <p>
                                                                        {meetup.notes}
                                                                    </p>

                                                                </div>
                                                            )}

                                                        </div>
                                                    )}


                                                {form && (

                                                    <div className="meetup-form">

                                                        <div className="meetup-form-header">

                                                            <div>
                                                                <h3>
                                                                    📅{" "}
                                                                    {meetup
                                                                        ? "Edit Meetup"
                                                                        : "Arrange Meetup"}
                                                                </h3>

                                                                <p>
                                                                    Enter the details for the book exchange meetup.
                                                                </p>
                                                            </div>

                                                        </div>


                                                        {meetupError && (
                                                            <div className="meetup-error">
                                                                {meetupError}
                                                            </div>
                                                        )}


                                                        <div className="meetup-form-grid">

                                                            <div className="meetup-field">

                                                                <label>
                                                                    Meetup Date
                                                                </label>

                                                                <input
                                                                    type="date"
                                                                    value={
                                                                        form.meetup_date ||
                                                                        ""
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
                                                                    Meetup Time
                                                                </label>

                                                                <input
                                                                    type="time"
                                                                    value={
                                                                        form.meetup_time ||
                                                                        ""
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
                                                                Meetup Location
                                                            </label>

                                                            <input
                                                                type="text"
                                                                placeholder="Enter meetup location"
                                                                value={
                                                                    form.location ||
                                                                    ""
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
                                                                placeholder="Add any additional information..."
                                                                value={
                                                                    form.notes ||
                                                                    ""
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


                                                        <div className="meetup-form-actions">

                                                            <button
                                                                type="button"
                                                                className="meetup-cancel-button"
                                                                onClick={() =>
                                                                    setMeetupForms(
                                                                        (current) => ({
                                                                            ...current,
                                                                            [request.request_id]:
                                                                                undefined
                                                                        })
                                                                    )
                                                                }
                                                            >
                                                                Cancel
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="meetup-save-button"
                                                                onClick={() =>
                                                                    saveMeetup(
                                                                        request.request_id
                                                                    )
                                                                }
                                                                disabled={
                                                                    isMeetupLoading
                                                                }
                                                            >
                                                                {isMeetupLoading
                                                                    ? "Saving..."
                                                                    : "Save Meetup"}
                                                            </button>

                                                        </div>

                                                    </div>
                                                )}

                                            </div>
                                        )}


                                        {/* Complete */}
                                        {request.status ===
                                            "Accepted" && (

                                           <button
                                                className="complete-button"
                                                onClick={() =>
                                                    completeExchange(
                                                        request.request_id
                                                    )
                                                }
                                            >
                                                ✓ Mark as Completed
                                            </button>
                                        )}


                                        {/* Completed */}
                                        {request.status ===
                                            "Completed" && (

                                            <div className="completed-notice">

                                                ✓ Exchange completed successfully

                                            </div>
                                        )}


                                        {/* Rating */}
                                        {request.status ===
                                            "Completed" && (

                                            <div className="rating-section">

                                                {!ratingData?.rated &&
                                                    !ratingForm && (

                                                        <div className="rating-start">

                                                            <div>
                                                                <h3>
                                                                    ⭐ Rate the Book Owner
                                                                </h3>

                                                                <p>
                                                                    Share your experience with{" "}
                                                                    <strong>
                                                                        {request.owner_name}
                                                                    </strong>
                                                                </p>
                                                            </div>

                                                            <button
                                                                type="button"
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
                                                                    ⭐ Rate {request.owner_name}
                                                                </h3>

                                                                <p>
                                                                    How was your exchange experience?
                                                                </p>
                                                            </div>

                                                        </div>


                                                        {ratingError && (
                                                            <div className="rating-error">
                                                                {ratingError}
                                                            </div>
                                                        )}


                                                        <div className="star-rating">

                                                            {[1, 2, 3, 4, 5].map(
                                                                (star) => (

                                                                    <button
                                                                        key={star}
                                                                        type="button"
                                                                        className={
                                                                            star <=
                                                                            ratingForm.rating
                                                                                ? "star active"
                                                                                : "star"
                                                                        }
                                                                        onClick={() =>
                                                                            handleRatingChange(
                                                                                request.request_id,
                                                                                "rating",
                                                                                star
                                                                            )
                                                                        }
                                                                        aria-label={`${star} star`}
                                                                    >
                                                                        ★
                                                                    </button>

                                                                )
                                                            )}

                                                        </div>


                                                        <div className="rating-field">

                                                            <label>
                                                                Review
                                                                <span>
                                                                    {" "}
                                                                    (Optional)
                                                                </span>
                                                            </label>

                                                            <textarea
                                                                rows="4"
                                                                placeholder="Share your experience with this user..."
                                                                value={
                                                                    ratingForm.review ||
                                                                    ""
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
                                                                        (current) => ({
                                                                            ...current,
                                                                            [request.request_id]:
                                                                                undefined
                                                                        })
                                                                    )
                                                                }
                                                            >
                                                                Cancel
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="rating-submit-button"
                                                                onClick={() =>
                                                                    submitRating(
                                                                        request.request_id
                                                                    )
                                                                }
                                                                disabled={
                                                                    isRatingLoading
                                                                }
                                                            >
                                                                {isRatingLoading
                                                                    ? "Submitting..."
                                                                    : "Submit Rating"}
                                                            </button>

                                                        </div>

                                                    </div>
                                                )}


                                                {ratingData?.rated && (

                                                    <div className="rating-submitted">

                                                        <div className="rating-submitted-header">

                                                            <div>
                                                                <h3>
                                                                    ⭐ Your Rating
                                                                </h3>

                                                                <p>
                                                                    You rated{" "}
                                                                    <strong>
                                                                        {ratingData.rating.rated_user_name}
                                                                    </strong>
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
                                                                        key={star}
                                                                        className={
                                                                            star <=
                                                                            ratingData.rating.rating
                                                                                ? "submitted-star active"
                                                                                : "submitted-star"
                                                                        }
                                                                    >
                                                                        ★
                                                                    </span>

                                                                )
                                                            )}

                                                        </div>


                                                        {ratingData.rating.review && (

                                                            <div className="submitted-review">

                                                                <span>
                                                                    Review
                                                                </span>

                                                                <p>
                                                                    {ratingData.rating.review}
                                                                </p>

                                                            </div>
                                                        )}


                                                    </div>
                                                )}

                                            </div>
                                        )}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

        </div>
    );
};

export default MyRequests;