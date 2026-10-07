import { useEffect, useState } from "react";
import API_URL from "../../utils/api";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/admin/users`,
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
                        data.message || "Failed to retrieve users"
                    );
                }

                setUsers(data.users);

            } catch (err) {
                setError(err.message);

                console.error("Get users error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

const handleRoleChange = (userId, newRole) => {
    const selectedUser = users.find(
        (user) => user.user_id === userId
    );

    if (!selectedUser) {
        return;
    }

    setActionError("");

    setConfirmAction({
        type: "role",
        userId: userId,
        newRole: newRole,
        userName: selectedUser.name,
        title: "Change User Role",
        message: `Are you sure you want to change ${selectedUser.name}'s role to ${newRole === "admin" ? "Admin" : "User"}?`
    });

    setShowConfirmModal(true);
};

const handleDeactivateUser = (userId) => {
    const selectedUser = users.find(
        (user) => user.user_id === userId
    );

    if (!selectedUser) {
        return;
    }

    setActionError("");

    setConfirmAction({
        type: "deactivate",
        userId: userId,
        userName: selectedUser.name,
        title: "Deactivate User",
        message: `Are you sure you want to deactivate ${selectedUser.name}'s account?`
    });

    setShowConfirmModal(true);
};

const handleActivateUser = (userId) => {
    const selectedUser = users.find(
        (user) => user.user_id === userId
    );

    if (!selectedUser) {
        return;
    }

    setActionError("");

    setConfirmAction({
        type: "activate",
        userId: userId,
        userName: selectedUser.name,
        title: "Activate User",
        message: `Are you sure you want to activate ${selectedUser.name}'s account?`
    });

    setShowConfirmModal(true);
};

const confirmUserAction = async () => {
    if (!confirmAction) {
        return;
    }

    setActionLoading(true);
    setActionError("");

    try {
        const token = localStorage.getItem("token");

        let url = "";
        let method = "PUT";
        let body = undefined;

        // ==============================
        // CHANGE ROLE
        // ==============================

        if (confirmAction.type === "role") {
            url = `${API_URL}/api/admin/users/${confirmAction.userId}/role`;

            body = JSON.stringify({
                role: confirmAction.newRole
            });
        }

        // ==============================
        // DEACTIVATE
        // ==============================

        if (confirmAction.type === "deactivate") {
            url = `${API_URL}/api/admin/users/${confirmAction.userId}/deactivate`;
        }

        // ==============================
        // ACTIVATE
        // ==============================

        if (confirmAction.type === "activate") {
            url = `${API_URL}/api/admin/users/${confirmAction.userId}/activate`;
        }

        const headers = {
            Authorization: `Bearer ${token}`
        };

        if (body) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, {
            method,
            headers,
            body
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to update user."
            );
        }

        // ==============================
        // UPDATE ROLE
        // ==============================

        if (confirmAction.type === "role") {
            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.user_id === confirmAction.userId
                        ? {
                            ...user,
                            role: confirmAction.newRole
                        }
                        : user
                )
            );
        }

        // ==============================
        // UPDATE STATUS
        // ==============================

        if (
            confirmAction.type === "activate" ||
            confirmAction.type === "deactivate"
        ) {
            const newStatus =
                confirmAction.type === "activate"
                    ? "active"
                    : "inactive";

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.user_id === confirmAction.userId
                        ? {
                            ...user,
                            status: newStatus
                        }
                        : user
                )
            );
        }

        setShowConfirmModal(false);
        setConfirmAction(null);

    } catch (err) {

        console.error(
            "User management action error:",
            err
        );

        setActionError(err.message);

    } finally {
        setActionLoading(false);
    }
};

    // Loading state
    if (loading) {
        return (
            <div className="admin-page-container">
                <div className="admin-loading">
                    <div className="admin-loading-icon">⏳</div>

                    <h3>Loading Users</h3>

                    <p>
                        Please wait while we retrieve the user list.
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="admin-page-container">
                <div className="admin-error">
                    <div className="admin-error-icon">⚠️</div>

                    <h3>Unable to Load Users</h3>

                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-container">

            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1>User Management</h1>

                    <p>
                        Manage registered users and their account access.
                    </p>
                </div>
            </div>

            {/* Search and Summary */}
            <div className="user-management-toolbar">

                <div className="user-search-box">
                    <span>🔎</span>

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="user-count">
                    Showing <strong>{filteredUsers.length}</strong> of{" "}
                    <strong>{users.length}</strong> users
                </div>

            </div>

            {/* User Table */}
            <div className="admin-table-card">

                {users.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>

                        <h3>No Users Found</h3>

                        <p>
                            There are currently no registered users.
                        </p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔎</div>

                        <h3>No Matching Users</h3>

                        <p>
                            No users match your current search.
                        </p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Location</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredUsers.map((user) => {

                                    const currentUser =
                                        JSON.parse(
                                            localStorage.getItem("user")
                                        )?.user_id;

                                    const isCurrentAdmin =
                                        user.role === "admin" &&
                                        user.user_id === currentUser;

                                    return (
                                        <tr key={user.user_id}>

                                            {/* ID */}
                                            <td>
                                                <span className="user-id">
                                                    #{user.user_id}
                                                </span>
                                            </td>

                                            {/* User */}
                                            <td>
                                                <div className="user-table-info">

<div className="user-table-avatar">
    {user.profile_image ? (
        <img
            src={user.profile_image}
            alt={user.name}
            className="user-table-avatar-image"
        />
    ) : (
        user.name
            ?.charAt(0)
            .toUpperCase()
    )}
</div>

                                                    <div>
                                                        <strong>
                                                            {user.name}
                                                        </strong>

                                                        <span>
                                                            {user.role === "admin" ? "Admin" : "Community Member"}
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td>
                                                <span className="user-email">
                                                    {user.email}
                                                </span>
                                            </td>

                                            {/* Location */}
                                            <td>
                                                {user.location || (
                                                    <span className="not-specified">
                                                        Not specified
                                                    </span>
                                                )}
                                            </td>

                                            {/* Role */}
                                            <td>
                                                {isCurrentAdmin ? (
                                                    <span className="role-badge admin-role">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <select
                                                        className="role-select"
                                                        value={user.role}
                                                        onChange={(e) =>
                                                            handleRoleChange(
                                                                user.user_id,
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="user">
                                                            User
                                                        </option>

                                                        <option value="admin">
                                                            Admin
                                                        </option>
                                                    </select>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span
                                                    className={`user-status ${
                                                        user.status === "active"
                                                            ? "status-active"
                                                            : "status-inactive"
                                                    }`}
                                                >
                                                    <span className="status-dot">
                                                        ●
                                                    </span>

                                                    {user.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                {isCurrentAdmin ? (
                                                    <span className="current-admin">
                                                        Current Admin
                                                    </span>
                                                ) : user.status === "active" ? (
                                                    <button
                                                        className="user-action-button deactivate-button"
                                                        onClick={() =>
                                                            handleDeactivateUser(
                                                                user.user_id
                                                            )
                                                        }
                                                    >
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="user-action-button activate-button"
                                                        onClick={() =>
                                                            handleActivateUser(
                                                                user.user_id
                                                            )
                                                        }
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}



            </div>

{showConfirmModal && confirmAction && (
    <div
        className="user-confirm-modal-overlay"
        onClick={() => {
            if (!actionLoading) {
                setShowConfirmModal(false);
                setConfirmAction(null);
                setActionError("");
            }
        }}
    >
        <div
            className="user-confirm-modal"
            onClick={(e) => e.stopPropagation()}
        >

            <div className="user-confirm-modal-icon">
                ?
            </div>

            <h2>
                {confirmAction.title}
            </h2>

            <p>
                {confirmAction.message}
            </p>

            {actionError && (
                <div className="user-confirm-error">
                    {actionError}
                </div>
            )}

            <div className="user-confirm-modal-actions">

                <button
                    className="user-confirm-cancel"
                    disabled={actionLoading}
                    onClick={() => {
                        setShowConfirmModal(false);
                        setConfirmAction(null);
                        setActionError("");
                    }}
                >
                    Cancel
                </button>

                <button
                    className="user-confirm-button"
                    disabled={actionLoading}
                    onClick={confirmUserAction}
                >
                    {actionLoading
                        ? "Processing..."
                        : "Confirm"}
                </button>

            </div>

        </div>
    </div>
)}

        </div>
    );
};

export default UserManagement;
