import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_URL from "../utils/api";

const Profile = () => {
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);

    const [ratings, setRatings] = useState([]);
    const [ratingsLoading, setRatingsLoading] = useState(true);
    const [ratingsError, setRatingsError] = useState("");

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showConfirm, setShowConfirm] = useState(false);

    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] =
    useState("");
    const [imageSaving, setImageSaving] = useState(false);

    // =========================
    // GET PROFILE
    // =========================
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/auth/profile`,
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
                    data.message || "Failed to load profile."
                );
            }

            setProfile(data.user);
            setName(data.user.name || "");
            setLocation(data.user.location || "");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (profile?.user_id) {
        fetchRatings(profile.user_id);
        }
    }, [profile?.user_id]);


    const handleProfileImageChange = (e) => {
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
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        setError(
            "Profile image must be smaller than 5MB."
        );
        return;
    }

    setError("");
    setProfileImage(file);

    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);
};

// =========================
// GET RATINGS
// =========================
const fetchRatings = async (userId) => {
    try {
        setRatingsLoading(true);
        setRatingsError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/api/ratings/user/${userId}`,
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
                data.message || "Failed to load ratings."
            );
        }

        setRatings(data);

    } catch (err) {
        setRatingsError(err.message);
    } finally {
        setRatingsLoading(false);
    }
};

    // =========================
    // CLICK SAVE CHANGES
    // =========================
    const handleSave = (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim() || !location.trim()) {
            setError("Name and location are required.");
            return;
        }

        // Show confirmation modal
        setShowConfirm(true);
    };

    // =========================
    // CONFIRM SAVE
    // =========================
const confirmSave = async () => {
    setShowConfirm(false);
    setSaving(true);
    setError("");
    setSuccess("");

    try {
        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");

        // ==========================================
        // 1. Update name and location
        // ==========================================

        const profileResponse = await fetch(
            `${API_URL}/api/auth/profile`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    location
                })
            }
        );

        const profileData =
            await profileResponse.json();

        if (!profileResponse.ok) {
            throw new Error(
                profileData.message ||
                "Failed to update profile."
            );
        }

        let updatedUser = profileData.user;

        // ==========================================
        // 2. Upload profile image if selected
        // ==========================================

        if (profileImage) {
            setImageSaving(true);

            const formData = new FormData();

            formData.append(
                "profile_image",
                profileImage
            );

            const imageResponse = await fetch(
                `${API_URL}/api/auth/profile/image`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const imageData =
                await imageResponse.json();

            if (!imageResponse.ok) {
                throw new Error(
                    imageData.message ||
                    "Failed to upload profile image."
                );
            }

            updatedUser = imageData.user;

            setProfileImage(null);
            setProfileImagePreview("");
        }

        // ==========================================
        // 3. Update profile on screen
        // ==========================================

        setProfile(updatedUser);

        setName(updatedUser.name);
        setLocation(updatedUser.location);

        setEditing(false);

        setSuccess(
            "Profile updated successfully."
        );

    } catch (err) {

        console.error(
            "Update profile error:",
            err
        );

        setError(err.message);

    } finally {

        setSaving(false);
        setImageSaving(false);
    }
};

    // =========================
    // CANCEL CONFIRMATION
    // =========================
    const cancelConfirmation = () => {
        if (!saving) {
            setShowConfirm(false);
        }
    };

    // =========================
    // CANCEL EDITING
    // =========================
    const handleCancel = () => {
        setName(profile?.name || "");
        setLocation(profile?.location || "");

        setEditing(false);
        setError("");
        setSuccess("");
    };

    // =========================
    // RATING SUMMARY
    // =========================
const averageRating =
    ratings.length > 0
        ? ratings.reduce(
              (total, item) =>
                  total + Number(item.rating),
              0
          ) / ratings.length
        : 0;

const roundedAverage = Math.round(averageRating * 10) / 10;

const recentRatings = ratings.slice(0, 3);

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="profile-loading-icon">
                        ⏳
                    </div>

                    <h3>Loading Profile</h3>

                    <p>
                        Please wait while we retrieve your information.
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // PROFILE ERROR
    // =========================
    if (!profile) {
        return (
            <div className="profile-page">
                <div className="profile-error">

                    <div>⚠️</div>

                    <h3>Unable to Load Profile</h3>

                    <p>
                        {error ||
                            "Profile information could not be found."}
                    </p>

                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">

            {/* =========================
                PAGE HEADER
            ========================= */}
            <div className="page-header">

                <div>
                    <h1>My Profile</h1>

                    <p>
                        View and manage your account information.
                    </p>
                </div>

                {!editing && (
                    <button
                        className="header-primary-button"
                        onClick={() => {
                            setEditing(true);
                            setSuccess("");
                            setError("");
                        }}
                    >
                        ✏ Edit Profile
                    </button>
                )}

            </div>


            {/* =========================
                ERROR MESSAGE
            ========================= */}
            {error && (
                <div className="profile-message profile-message-error">
                    <span>⚠</span>
                    <span>{error}</span>
                </div>
            )}


            {/* =========================
                SUCCESS MESSAGE
            ========================= */}
            {success && (
                <div className="profile-message profile-message-success">
                    <span>✓</span>
                    <span>{success}</span>
                </div>
            )}


            {/* =========================
                PROFILE CONTENT
            ========================= */}
            <div className="profile-layout">

                {/* =========================
                    PROFILE OVERVIEW
                ========================= */}
                <div className="profile-card profile-overview-card">

<div className="profile-avatar-large">

    {profileImagePreview ? (

        <img
            src={profileImagePreview}
            alt="Profile"
            className="profile-avatar-image"
        />

    ) : profile.profile_image ? (

        <img
            src={profile.profile_image}
            alt="Profile"
            className="profile-avatar-image"
        />

    ) : (

        profile.name?.charAt(0).toUpperCase()

    )}

</div>

{editing && (
    <div className="profile-image-upload">

        <label
            htmlFor="profile-image-input"
            className="profile-image-button"
        >
            📷 Change Profile Picture
        </label>

        <input
            id="profile-image-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleProfileImageChange}
            hidden
        />

        <small>
            JPG, PNG or WEBP • Maximum 5MB
        </small>

    </div>
)}

                    <h2>{profile.name}</h2>

                    <p className="profile-email">
                        {profile.email}
                    </p>

                    <span className="profile-role-badge">
                        {profile.role === "admin"
                            ? "Administrator"
                            : "Community User"}
                    </span>

                </div>


                {/* =========================
                    PERSONAL INFORMATION
                ========================= */}
                <div className="profile-card profile-information-card">

                    <div className="profile-card-header">

                        <div>
                            <h2>Personal Information</h2>

                            <p>
                                Your account information and details.
                            </p>
                        </div>

                    </div>


                    <form onSubmit={handleSave}>

                        <div className="profile-fields">

                            {/* =========================
                                FULL NAME
                            ========================= */}
                            <div className="profile-field">

                                <label>
                                    Full Name
                                </label>

                                {editing ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Enter your name"
                                        required
                                    />
                                ) : (
                                    <div className="profile-field-value">
                                        {profile.name}
                                    </div>
                                )}

                            </div>


                            {/* =========================
                                EMAIL
                            ========================= */}
                            <div className="profile-field">

                                <label>
                                    Email Address
                                </label>

                                <div className="profile-field-value profile-field-disabled">
                                    {profile.email}
                                </div>

                                {editing && (
                                    <small>
                                        Email address cannot be changed.
                                    </small>
                                )}

                            </div>


                            {/* =========================
                                LOCATION
                            ========================= */}
                            <div className="profile-field">

                                <label>
                                    Location
                                </label>

                                {editing ? (
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) =>
                                            setLocation(e.target.value)
                                        }
                                        placeholder="Enter your location"
                                        required
                                    />
                                ) : (
                                    <div className="profile-field-value">
                                        {profile.location ||
                                            "Not specified"}
                                    </div>
                                )}

                            </div>


                            {/* =========================
                                ACCOUNT ROLE
                            ========================= */}
                            <div className="profile-field">

                                <label>
                                    Account Role
                                </label>

                                <div className="profile-field-value">
                                    {profile.role === "admin"
                                        ? "Administrator"
                                        : "Community User"}
                                </div>

                            </div>


                            {/* =========================
                                ACCOUNT STATUS
                            ========================= */}
                            <div className="profile-field">

                                <label>
                                    Account Status
                                </label>

                                <div className="profile-field-value">

                                    <span
                                        className={`profile-status ${
                                            profile.status === "active"
                                                ? "profile-status-active"
                                                : "profile-status-inactive"
                                        }`}
                                    >

                                        <span className="profile-status-dot">
                                            ●
                                        </span>

                                        {profile.status}

                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* =========================
                            EDIT ACTIONS
                        ========================= */}
                        {editing && (
                            <div className="profile-form-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={handleCancel}
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
                        )}

                    </form>

                </div>

            </div>

            {/* =========================
                RATINGS & REVIEWS
            ========================= */}
            <div className="profile-card profile-ratings-card">

                <div className="profile-card-header-ratings">

                    <div>
                        <h2>Ratings & Reviews</h2>

                        <p>
                            See what other community members think
                            about their exchange experience with you.
                        </p>
                    </div>

                </div>


                {ratingsLoading && (
                    <div className="ratings-loading">
                        Loading ratings...
                    </div>
                )}


                {!ratingsLoading && ratingsError && (
                    <div className="ratings-error">
                        {ratingsError}
                    </div>
                )}


                {!ratingsLoading &&
                    !ratingsError &&
                    ratings.length === 0 && (
                        <div className="ratings-empty">

                            <div className="ratings-empty-icon">
                                ⭐
                            </div>

                            <h3>No ratings yet</h3>

                            <p>
                                Ratings from completed exchanges
                                will appear here.
                            </p>

                        </div>
                    )}


                {!ratingsLoading &&
                    !ratingsError &&
                    ratings.length > 0 && (
                        <>

                            {/* Rating Summary */}
                            <div className="rating-summary">

                                <div className="rating-average">

                                    <div className="rating-average-number">
                                        {roundedAverage}
                                    </div>

                                    <div className="rating-average-stars">

                                        {[1, 2, 3, 4, 5].map(
                                            (star) => (
                                                <span
                                                    key={star}
                                                    className={
                                                        star <=
                                                        Math.round(
                                                            averageRating
                                                        )
                                                            ? "summary-star active"
                                                            : "summary-star"
                                                    }
                                                >
                                                    ★
                                                </span>
                                            )
                                        )}

                                    </div>

                                    <p>
                                        Based on{" "}
                                        {ratings.length}{" "}
                                        {ratings.length === 1
                                            ? "rating"
                                            : "ratings"}
                                    </p>

                                </div>

                            </div>


                            {/* Recent Reviews */}
                            <div className="recent-reviews">

                                <h3>
                                    Recent Reviews
                                </h3>

                                {recentRatings.map((rating) => (
                                    <div
                                        className="review-card"
                                        key={rating.rating_id}
                                    >

                                        <div className="review-header">

                                            <div>
                                                <strong>
                                                    {rating.reviewer_name}
                                                </strong>

                                                <div className="review-stars">

                                                    {[1, 2, 3, 4, 5].map(
                                                        (star) => (
                                                            <span
                                                                key={star}
                                                                className={
                                                                    star <=
                                                                    Number(
                                                                        rating.rating
                                                                    )
                                                                        ? "review-star active"
                                                                        : "review-star"
                                                                }
                                                            >
                                                                ★
                                                            </span>
                                                        )
                                                    )}

                                                </div>

                                            </div>

                                            <span className="review-date">
                                                {new Date(
                                                    rating.created_at
                                                ).toLocaleDateString(
                                                    "en-MY",
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </span>

                                        </div>


                                        {rating.review && (
                                            <p className="review-text">
                                                "{rating.review}"
                                            </p>
                                        )}

                                    </div>
                                ))}

                            </div>

                        </>
                    )}

            </div>

            {/* =========================
                CONFIRMATION MODAL
            ========================= */}
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
                            Are you sure you want to save these
                            changes to your profile?
                        </p>

                        <div className="confirmation-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={cancelConfirmation}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={confirmSave}
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

        </div>
    );
};

export default Profile;