import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../utils/api";

const EditBook = ({ book, onBack, onSuccess }) => {
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [genre, setGenre] = useState("");
    const [conditionStatus, setConditionStatus] =
        useState("");
    const [description, setDescription] =
        useState("");
    const [location, setLocation] = useState("");
    const [status, setStatus] =
        useState("Available");

    const [coverImage, setCoverImage] =
        useState(null);
    const [imagePreview, setImagePreview] =
        useState("");
    const [removeCover, setRemoveCover] =
        useState(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showConfirm, setShowConfirm] =
        useState(false);

    const [showRemoveCoverConfirm, setShowRemoveCoverConfirm] =
        useState(false);

    const [showSuccessModal, setShowSuccessModal] =
        useState(false);

    /*
     * Load selected book information
     */
    useEffect(() => {
        if (!book) {
            return;
        }

        setTitle(book.title || "");
        setAuthor(book.author || "");
        setGenre(book.genre || "");
        setConditionStatus(
            book.condition_status || ""
        );
        setDescription(book.description || "");
        setLocation(book.location || "");
        setStatus(book.status || "Available");

        setCoverImage(null);
        setRemoveCover(false);
        setError("");

        if (book.cover_image) {
            setImagePreview(
                `${API_URL}/uploads/${book.cover_image}`
            );
        } else {
            setImagePreview("");
        }
    }, [book]);

    /*
     * Handle cover image selection
     */
    const handleCoverChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            );

            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(
                "Cover image must be smaller than 5MB."
            );

            e.target.value = "";
            return;
        }

        setError("");
        setCoverImage(file);
        setRemoveCover(false);

        const previewUrl =
            URL.createObjectURL(file);

        setImagePreview(previewUrl);
    };

    /*
     * Remove cover
     */
    const handleRemoveCover = () => {
        setCoverImage(null);
        setRemoveCover(true);
        setImagePreview("");
    };

    /*
     * Submit edit form
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        setError("");

        if (!title.trim() || !author.trim()) {
            setError(
                "Book title and author are required."
            );
            return;
        }

        setShowConfirm(true);
    };

    /*
     * Confirm and save changes
     */
    const confirmSave = async () => {
        try {
            setSaving(true);
            setShowConfirm(false);
            setError("");

            const formData = new FormData();

            formData.append(
                "title",
                title
            );

            formData.append(
                "author",
                author
            );

            formData.append(
                "genre",
                genre
            );

            formData.append(
                "condition_status",
                conditionStatus
            );

            formData.append(
                "description",
                description
            );

            formData.append(
                "location",
                location
            );

            formData.append(
                "status",
                status
            );

            if (coverImage) {
                formData.append(
                    "cover_image",
                    coverImage
                );
            }

            if (removeCover) {
                formData.append(
                    "remove_cover",
                    "true"
                );
            }

            const response = await fetch(
                `${API_URL}/api/books/${book.book_id}`,
                {
                    method: "PUT",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update book"
                );
            }

            setCoverImage(null);
            setRemoveCover(false);

            setShowSuccessModal(true);

        } catch (err) {
            setError(err.message);

        } finally {
            setSaving(false);
        }
    };

    /*
     * If no book is selected
     */
    if (!book) {
        return (
            <div>
                <p>
                    No book selected for editing.
                </p>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={onBack}
                >
                    ← Back to My Books
                </button>
            </div>
        );
    }

    return (
        <div>

            {/* PAGE HEADER */}
            <div className="page-header">

                <div>
                    <h1>
                        Edit Book
                    </h1>

                    <p>
                        Update the information of your
                        listed book.
                    </p>
                </div>

                <button
                    type="button"
                    className="header-primary-button"
                    onClick={onBack}
                    disabled={saving}
                >
                    ← Back to My Books
                </button>

            </div>


            {/* ERROR MESSAGE */}
            {error && (
                <div className="edit-book-message edit-book-error-message">

                    <span>⚠</span>

                    <span>
                        {error}
                    </span>

                </div>
            )}


            {/* EDIT BOOK CARD */}
            <div className="edit-book-card">

                <div className="edit-book-card-header">

                    <div className="edit-book-icon">
                        📚
                    </div>

                    <div>

                        <h2>
                            Book Information
                        </h2>

                        <p>
                            Make changes to your book
                            details below.
                        </p>

                    </div>

                </div>


                <form onSubmit={handleSubmit}>

                    <div className="edit-book-form">


                        {/* COVER */}
                        <div className="edit-book-field edit-book-field-full">

                            <label>
                                Book Cover
                            </label>

                            <div className="edit-cover-section">

                                <div className="edit-cover-preview">

                                    {imagePreview ? (

                                        <img
                                            src={imagePreview}
                                            alt={`${title} cover`}
                                            className="edit-cover-image"
                                        />

                                    ) : (

                                        <div className="edit-cover-placeholder">

                                            <span>
                                                📖
                                            </span>

                                            <p>
                                                No cover image
                                            </p>

                                        </div>

                                    )}

                                </div>


                                <div className="edit-cover-actions">

                                    <label
                                        htmlFor="edit-cover-input"
                                        className="secondary-button edit-cover-button"
                                    >
                                        📷 Change Cover
                                    </label>

                                    <input
                                        id="edit-cover-input"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={
                                            handleCoverChange
                                        }
                                        hidden
                                    />


                                    {imagePreview && (
                                        <button
                                            type="button"
                                            className="remove-cover-button"
                                            onClick={() =>
                                                setShowRemoveCoverConfirm(
                                                    true
                                                )
                                            }
                                            disabled={saving}
                                        >
                                            Remove Cover
                                        </button>
                                    )}


                                    <small>
                                        JPG, JPEG, PNG or WEBP.
                                        Maximum 5MB.
                                    </small>

                                </div>

                            </div>

                        </div>


                        {/* TITLE */}
                        <div className="edit-book-field edit-book-field-full">

                            <label>
                                Book Title
                                <span className="required-mark">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={title}
                                onChange={(e) =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter book title"
                                required
                            />

                        </div>


                        {/* AUTHOR */}
                        <div className="edit-book-field">

                            <label>
                                Author
                                <span className="required-mark">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={author}
                                onChange={(e) =>
                                    setAuthor(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter author name"
                                required
                            />

                        </div>


                        {/* GENRE */}
                        <div className="edit-book-field">

                            <label>
                                Genre
                            </label>

                            <select
                                value={genre}
                                onChange={(e) =>
                                    setGenre(
                                        e.target.value
                                    )
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
                        <div className="edit-book-field">

                            <label>
                                Book Condition
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

                                <option value="Poor">
                                    Poor
                                </option>

                            </select>

                        </div>


                        {/* STATUS */}
                        <div className="edit-book-field">

                            <label>
                                Book Status
                            </label>

                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="Available">
                                    Available
                                </option>

                                <option value="Unavailable">
                                    Unavailable
                                </option>

                                <option value="Exchanged">
                                    Exchanged
                                </option>

                            </select>

                        </div>


                        {/* LOCATION */}
                        <div className="edit-book-field edit-book-field-full">

                            <label>
                                Location
                            </label>

                            <input
                                type="text"
                                value={location}
                                onChange={(e) =>
                                    setLocation(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter meetup or book location"
                            />

                        </div>


                        {/* DESCRIPTION */}
                        <div className="edit-book-field edit-book-field-full">

                            <label>
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                placeholder="Add additional information about the book..."
                                rows="6"
                            />

                            <small>
                                Provide useful information
                                about the book that other
                                community members may want
                                to know.
                            </small>

                        </div>


                    </div>


                    {/* FORM BUTTONS */}
                    <div className="edit-book-form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onBack}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>


            {/* SAVE CONFIRMATION MODAL */}
            {showConfirm && (

                <div className="confirmation-overlay">

                    <div className="confirmation-modal">

                        <div className="confirmation-icon">
                            ?
                        </div>

                        <h2>
                            Save Changes?
                        </h2>

                        <p>
                            Are you sure you want to save
                            these changes to this book?
                        </p>

                        <div className="confirmation-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setShowConfirm(
                                        false
                                    )
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={
                                    confirmSave
                                }
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Confirm"}
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* REMOVE COVER CONFIRMATION MODAL */}
            {showRemoveCoverConfirm && (

                <div className="confirmation-overlay">

                    <div className="confirmation-modal">

                        <div className="confirmation-icon">
                            !
                        </div>

                        <h2>
                            Remove Cover?
                        </h2>

                        <p>
                            Are you sure you want to remove
                            the cover?
                        </p>

                        <div className="confirmation-actions">

                            <button
                                type="button"
                                className="confirmation-cancel"
                                onClick={() =>
                                    setShowRemoveCoverConfirm(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirmation-confirm"
                                onClick={() => {
                                    handleRemoveCover();

                                    setShowRemoveCoverConfirm(
                                        false
                                    );
                                }}
                            >
                                Yes, Remove
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* SUCCESS MODAL */}
            {showSuccessModal && (

                <div className="confirmation-overlay">

                    <div className="confirmation-modal">

                        <div className="success-modal-icon">
                            ✓
                        </div>

                        <h2>
                            Book Updated Successfully!
                        </h2>

                        <p>
                            Your book information has been
                            updated successfully.
                        </p>

                        <div className="confirmation-actions">

                            <button
                                type="button"
                                className="primary-button"
                                onClick={() => {

                                    setShowSuccessModal(
                                        false
                                    );

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

export default EditBook;