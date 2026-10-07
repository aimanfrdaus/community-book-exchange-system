import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../utils/api";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [unreadCount, setUnreadCount] = useState(0);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const linkClass = ({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`;

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await fetch(
                `${API_URL}/api/notifications/unread-count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setUnreadCount(data.unread_count || 0);
            }

        } catch (error) {
            console.error(
                "Failed to fetch notification count:",
                error
            );
        }
    };

    useEffect(() => {
        if (user && user.role !== "admin") {
            fetchUnreadCount();
        }
    }, [user]);

    useEffect(() => {
        const handleNotificationUpdate = () => {
            fetchUnreadCount();
        };

        window.addEventListener(
            "notificationsUpdated",
            handleNotificationUpdate
        );

        return () => {
            window.removeEventListener(
                "notificationsUpdated",
                handleNotificationUpdate
            );
        };
    }, []);

    return (
        <aside className="sidebar">

<div className="sidebar-brand">
    <img
        src="/logo.png"
        alt="Community Book Exchange System"
    />

    <span>
        Community Book Exchange System
    </span>
</div>

<div className="sidebar-user">
   <div className="user-avatar">
    {user?.profile_image ? (
        <img
            src={user.profile_image}
            alt="Profile"
            className="sidebar-profile-image"
        />
    ) : (
        user?.name?.charAt(0).toUpperCase()
    )}
</div>

                <div>
                    <strong>{user?.name}</strong>

                    <span>
                        {user?.role === "admin"
                            ? "Administrator"
                            : "Community User"}
                    </span>
                </div>
            </div>

            <nav className="sidebar-nav">

                {user?.role === "admin" ? (
                    <>
                        <p className="sidebar-section">
                            ADMINISTRATION
                        </p>

                        <NavLink
                            to="/admin/dashboard"
                            className={linkClass}
                        >
                            <span>📊</span>
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/admin/users"
                            className={linkClass}
                        >
                            <span>👥</span>
                            User Management
                        </NavLink>

                        <NavLink
                            to="/admin/books"
                            className={linkClass}
                        >
                            <span>📚</span>
                            Book Management
                        </NavLink>

                        <NavLink
                            to="/admin/reports"
                            className={linkClass}
                        >
                            <span>📝</span>
                            Report Management
                        </NavLink>
                    </>
                ) : (
                    <>
                        <p className="sidebar-section">
                            MAIN MENU
                        </p>

                        <NavLink
                            to="/dashboard"
                            className={linkClass}
                        >
                            <span>📊</span>
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/browse-books"
                            className={linkClass}
                        >
                            <span>🔎</span>
                            Browse Books
                        </NavLink>

                        <NavLink
                            to="/my-books"
                            className={linkClass}
                        >
                            <span>📖</span>
                            My Books
                        </NavLink>

                        <NavLink
                            to="/my-requests"
                            className={linkClass}
                        >
                            <span>📤</span>
                            My Requests
                        </NavLink>

                        <NavLink
                            to="/incoming-requests"
                            className={linkClass}
                        >
                            <span>📥</span>
                            Incoming Requests
                        </NavLink>

<NavLink
    to="/notifications"
    className={linkClass}
>
    <span>🔔</span>
    Notifications

    {unreadCount > 0 && (
        <span className="notification-badge">
            {unreadCount > 99
                ? "99+"
                : unreadCount}
        </span>
    )}
</NavLink>

<NavLink
    to="/faqs"
    className={linkClass}
>
    <span>❓</span>
    FAQs
</NavLink>

                        <p className="sidebar-section">
                            ACCOUNT
                        </p>

                        <NavLink
                            to="/profile"
                            className={linkClass}
                        >
                            <span>👤</span>
                            Profile
                        </NavLink>
                    </>
                )}

            </nav>

            <div className="sidebar-bottom">

                <button
                    className="logout-button"
                    onClick={() => setShowLogoutModal(true)}
                >
                    <span>↪</span>
                    Logout
                </button>

            </div>

{showLogoutModal && (
    <div className="logout-modal-overlay">

        <div className="logout-modal">

            <div className="logout-modal-icon">
                ↪
            </div>

            <h2>Logout</h2>

            <p>
                Are you sure you want to logout
                from your account?
            </p>

            <div className="logout-modal-actions">

                <button
                    className="logout-cancel-button"
                    onClick={() =>
                        setShowLogoutModal(false)
                    }
                >
                    Cancel
                </button>

                <button
                    className="logout-confirm-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </div>

    </div>
)}

        </aside>
    );
};

export default Sidebar;