import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../utils/api";

const AddBook = ({ onBack, onSuccess }) => {
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [genre, setGenre] = useState("");
    const [conditionStatus, setConditionStatus] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");

    const [coverImage, setCoverImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const [showConfirmation, setShowConfirmation] =
        useState(false);

    const [showSuccessModal, setShowSuccessModal] =
    useState(false);    

    // ===============================
    // HANDLE IMAGE SELECTION
    // ===============================
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        setError("");

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Please select a JPG, JPEG, PNG or WEBP image."
            );

            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(
                "The book cover image must be smaller than 5 MB."
            );

            e.target.value = "";
            return;
        }

        setCoverImage(file);

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    // ===============================
    // REMOVE IMAGE
    // ===============================
    const handleRemoveImage = () => {
        setCoverImage(null);
        setImagePreview("");
    };

    // ===============================
    // SHOW CONFIRMATION
    // ===============================
    const handleSubmit = (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!title.trim() || !author.trim()) {
            setError(
                "Please enter both the book title and author."
            );
            return;
        }

        setShowConfirmation(true);
    };

    // ===============================
    // CONFIRM ADD BOOK
    // ===============================
    const confirmAddBook = async () => {
        setShowConfirmation(false);
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();

            formData.append("user_id", user.user_id);
            formData.append("title", title);
            formData.append("author", author);
            formData.append("genre", genre);
            formData.append(
                "condition_status",
                conditionStatus
            );
            formData.append("description", description);
            formData.append("location", location);

            if (coverImage) {
                formData.append(
                    "cover_image",
                    coverImage
                );
            }

            const response = await fetch(
                `${API_URL}/api/books`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add book"
                );
            }

            setSuccess("Book added successfully!");
            setShowSuccessModal(true);

            // Clear form
            setTitle("");
            setAuthor("");
            setGenre("");
            setConditionStatus("");
            setDescription("");
            setLocation("");
            setCoverImage(null);
            setImagePreview("");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-book-page">

            {/* ===============================
                PAGE HEADER
            =============================== */}
            <div className="add-book-header">
                <div>
                    <h1>Add Book</h1>

                    <p>
                        Share a book with the community by
                        adding it to your exchange list.
                    </p>
                </div>
            </div>

            {/* ===============================
                SUCCESS / ERROR
            =============================== */}
            {success && (
                <div className="add-book-success">
                    ✓ {success}
                </div>
            )}

            {error && (
                <div className="add-book-error">
                    {error}
                </div>
            )}

            {/* ===============================
                FORM
            =============================== */}
            <form
                className="add-book-form"
                onSubmit={handleSubmit}
            >

                {/* ===============================
                    BOOK COVER
                =============================== */}
                <div className="add-book-section">

                    <div className="add-book-section-title">

                        <h2>Book Cover</h2>

                        <p>
                            Add a photo of the book cover
                            to help other users identify it.
                        </p>

                    </div>

                    <div className="book-cover-upload">

                        {imagePreview ? (
                            <div className="book-cover-preview">

                                <img
                                    src={imagePreview}
                                    alt="Book cover preview"
                                />

                                <button
                                    type="button"
                                    className="remove-cover-button"
                                    onClick={
                                        handleRemoveImage
                                    }
                                >
                                    Remove Photo
                                </button>

                            </div>
                        ) : (
                            <label
                                htmlFor="cover-image"
                                className="book-cover-placeholder"
                            >

                                <span className="upload-icon">
                                    📷
                                </span>

                                <strong>
                                    Upload Book Cover
                                </strong>

                                <span>
                                    Click to choose an image
                                </span>

                                <small>
                                    JPG, PNG or WEBP • Max 5 MB
                                </small>

                            </label>
                        )}

                        <input
                            id="cover-image"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                            hidden
                        />

                        {imagePreview && (
                            <label
                                htmlFor="cover-image"
                                className="change-cover-button"
                            >
                                Change Photo
                            </label>
                        )}

                    </div>

                </div>

                {/* ===============================
                    BASIC INFORMATION
                =============================== */}
                <div className="add-book-section">

                    <div className="add-book-section-title">

                        <h2>Book Information</h2>

                        <p>
                            Enter the basic information about
                            the book you want to exchange.
                        </p>

                    </div>

                    <div className="add-book-grid">

                        {/* TITLE */}
                        <div className="add-book-field full-width">

                            <label>
                                Book Title
                                <span className="required">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                placeholder="Enter the book title"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                                required
                            />

                        </div>

                        {/* AUTHOR */}
                        <div className="add-book-field">

                            <label>
                                Author
                                <span className="required">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                placeholder="Enter author name"
                                value={author}
                                onChange={(e) =>
                                    setAuthor(e.target.value)
                                }
                                required
                            />

                        </div>

                        {/* GENRE */}
                        <div className="add-book-field">

                            <label>
                                Genre
                            </label>

                            <select
                                value={genre}
                                onChange={(e) =>
                                    setGenre(e.target.value)
                                }
                            >

                                <option value="">
                                    Select genre
                                </option>

                                <option value="Fiction">
                                    Fiction
                                </option>

                                <option value="Non-Fiction">
                                    Non-Fiction
                                </option>

                                <option value="Academic">
                                    Academic
                                </option>

                                <option value="Science">
                                    Science
                                </option>

                                <option value="Technology">
                                    Technology
                                </option>

                                <option value="History">
                                    History
                                </option>

                                <option value="Biography">
                                    Biography
                                </option>

                                <option value="Fantasy">
                                    Fantasy
                                </option>

                                <option value="Mystery">
                                    Mystery
                                </option>

                                <option value="Romance">
                                    Romance
                                </option>

                                <option value="Horror">
                                    Horror
                                </option>

                                <option value="Self-Help">
                                    Self-Help
                                </option>

                                <option value="Children">
                                    Children
                                </option>

                                <option value="Religion">
                                    Religion
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>

                        {/* CONDITION */}
                        <div className="add-book-field">

                            <label>
                                Condition
                            </label>

                            <select
                                value={conditionStatus}
                                onChange={(e) =>
                                    setConditionStatus(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select condition
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

                        </div>

                        {/* LOCATION */}
                        <div className="add-book-field">

                            <label>
                                Location
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. Kuala Terengganu"
                                value={location}
                                onChange={(e) =>
                                    setLocation(e.target.value)
                                }
                            />

                        </div>

                        {/* DESCRIPTION */}
                        <div className="add-book-field full-width">

                            <label>
                                Description
                            </label>

                            <textarea
                                placeholder="Write a short description about the book..."
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                rows="5"
                            />

                            <span className="field-hint">
                                You can mention the book's condition,
                                edition or any other useful information.
                            </span>

                        </div>

                    </div>

                </div>

                {/* ===============================
                    BUTTONS
                =============================== */}
                <div className="add-book-actions">

                    <button
                        type="button"
                        className="cancel-book-button"
                        onClick={onBack}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="add-book-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Adding Book..."
                            : "Add Book"}
                    </button>

                </div>

            </form>

            {/* ===============================
                CONFIRMATION MODAL
            =============================== */}
            {showConfirmation && (
                <div className="confirmation-overlay">

                    <div className="confirmation-modal">

                        <div className="confirmation-icon">
                            ?
                        </div>

                        <h2>
                            Add this book?
                        </h2>

                        <p>
                            Are you sure you want to add{" "}
                            <strong>
                                "{title}"
                            </strong>{" "}
                            to your books?
                        </p>

                        <div className="confirmation-actions">

                            <button
                                type="button"
                                className="confirmation-cancel"
                                onClick={() =>
                                    setShowConfirmation(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirmation-confirm"
                                onClick={confirmAddBook}
                            >
                                Yes, Add Book
                            </button>

                        </div>

                    </div>

                </div>
            )}

{showSuccessModal && (
    <div className="confirmation-overlay">

        <div className="confirmation-modal">

            <div className="success-modal-icon">
                ✓
            </div>

            <h2>
                Book Added Successfully
            </h2>

            <p>
                Your book has been added to your list and is
                now available for the community to exchange.
            </p>

            <div className="confirmation-actions">

                <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                        setShowSuccessModal(false);

                        if (onSuccess) {
                            onSuccess();
                        }
                    }}
                >
                    OK
                </button>

            </div>

        </div>

    </div>
)}

        </div>
    );
};

export default AddBook;