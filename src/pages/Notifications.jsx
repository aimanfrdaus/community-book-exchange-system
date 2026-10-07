import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_URL from "../utils/api";

const Notifications = () => {
    const { user } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/notifications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load notifications."
                );
            }

            setNotifications(data);

        } catch (error) {
            console.error("Notification error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem("token");

const response = await fetch(
    `${API_URL}/api/notifications/${notificationId}/read`,
    {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }
);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to mark notification as read."
                );
            }

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.notification_id === notificationId
                        ? {
                              ...notification,
                              is_read: 1
                          }
                        : notification
                )
            );

window.dispatchEvent(
    new Event("notificationsUpdated")
);

        } catch (error) {
            console.error("Mark notification as read error:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/notifications/read-all`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to mark all notifications as read."
                );
            }

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) => ({
                    ...notification,
                    is_read: 1
                }))
            );

window.dispatchEvent(
    new Event("notificationsUpdated")
);

        } catch (error) {
            console.error("Mark all notifications as read error:", error);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    if (loading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Notifications</h1>
                        <p>View your latest exchange updates.</p>
                    </div>
                </div>

                <div className="empty-state">
                    <p>Loading notifications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Notifications</h1>
                        <p>View your latest exchange updates.</p>
                    </div>
                </div>

                <div className="empty-state">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Notifications</h1>
                    <p>
                        Stay updated with your book exchange activities.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        className="secondary-button"
                        onClick={markAllAsRead}
                    >
                        Mark All as Read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="empty-state">

                    <div className="empty-state-icon">
                        🔔
                    </div>

                    <h3>No notifications yet</h3>

                    <p>
                        You will see exchange updates here when
                        someone requests your book or when your
                        exchange request is updated.
                    </p>

                </div>
            ) : (
                <div className="notifications-list">

                    {notifications.map((notification) => (
                        <div
                            key={notification.notification_id}
                            className={`notification-card ${
                                notification.is_read
                                    ? "read"
                                    : "unread"
                            }`}
                            onClick={() => {
                                if (!notification.is_read) {
                                    markAsRead(
                                        notification.notification_id
                                    );
                                }
                            }}
                        >

                            <div className="notification-icon">
                                🔔
                            </div>

                            <div className="notification-content">

                                <div className="notification-top">

                                    <h3>
                                        {notification.title}
                                    </h3>

                                    {!notification.is_read && (
                                        <span className="notification-new">
                                            New
                                        </span>
                                    )}

                                </div>

                                <p>
                                    {notification.message}
                                </p>

                                <div className="notification-bottom">

                                    <span className="notification-date">
                                        {formatDate(
                                            notification.created_at
                                        )}
                                    </span>

                                    {!notification.is_read && (
                                        <span className="notification-action">
                                            Click to mark as read
                                        </span>
                                    )}

                                </div>

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};

export default Notifications;