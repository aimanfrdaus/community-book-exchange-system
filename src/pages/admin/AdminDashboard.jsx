import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../utils/api";

const AdminDashboard = () => {
    const { user } = useAuth();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBooks: 0,
        pendingExchanges: 0,
        completedExchanges: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/admin/dashboard/stats`,
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
                        data.message ||
                        "Failed to retrieve dashboard statistics"
                    );
                }

                setStats(data.stats);

            } catch (err) {
                setError(err.message);

                console.error(
                    "Dashboard stats error:",
                    err
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="admin-page-container">
                <div className="admin-loading">
                    <div className="admin-loading-icon">⏳</div>
                    <h3>Loading Dashboard</h3>
                    <p>
                        Please wait while we retrieve the latest statistics.
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

                    <h3>Unable to Load Dashboard</h3>

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
                    <h1>Admin Dashboard</h1>

                    <p>
                        Overview of the Community Book Exchange System.
                    </p>
                </div>

                <div className="admin-welcome">
                    <div className="admin-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <span>Welcome back</span>

                        <strong>
                            {user?.name}
                        </strong>
                    </div>
                </div>

            </div>

            {/* Statistics */}
            <section className="admin-section">

                <div className="admin-section-header">
                    <div>
                        <h2>System Overview</h2>

                        <p>
                            Current statistics of the platform.
                        </p>
                    </div>
                </div>

                <div className="admin-stats-grid">

                    {/* Total Users */}
                    <div className="admin-stat-card">


                        <div className="admin-stat-content">
                            <span>Total Users</span>

                            <strong>
                                {stats.totalUsers}
                            </strong>

                            <small>
                                Registered accounts
                            </small>
                        </div>

                    </div>

                    {/* Total Books */}
                    <div className="admin-stat-card">

                        <div className="admin-stat-content">
                            <span>Total Books</span>

                            <strong>
                                {stats.totalBooks}
                            </strong>

                            <small>
                                Books listed
                            </small>
                        </div>

                    </div>

                    {/* Pending Exchanges */}
                    <div className="admin-stat-card">


                        <div className="admin-stat-content">
                            <span>Pending Exchanges</span>

                            <strong>
                                {stats.pendingExchanges}
                            </strong>

                            <small>
                                Awaiting response
                            </small>
                        </div>

                    </div>

                    {/* Completed Exchanges */}
                    <div className="admin-stat-card">


                        <div className="admin-stat-content">
                            <span>Completed Exchanges</span>

                            <strong>
                                {stats.completedExchanges}
                            </strong>

                            <small>
                                Successfully completed
                            </small>
                        </div>

                    </div>

                </div>

            </section>

            {/* Admin Information */}
            <section className="admin-section">

                <div className="admin-section-header">
                    <div>
                        <h2>Administrator Account</h2>

                        <p>
                            Information about the currently logged-in
                            administrator.
                        </p>
                    </div>
                </div>

                <div className="admin-info-card">

                    <div className="admin-info-row">
                        <span>Name</span>
                        <strong>{user?.name}</strong>
                    </div>

                    <div className="admin-info-row">
                        <span>Email</span>
                        <strong>{user?.email}</strong>
                    </div>

                    <div className="admin-info-row">
                        <span>Role</span>

                        <span className="admin-role-badge">
                            Administrator
                        </span>
                    </div>

                </div>

            </section>

        </div>
    );
};

export default AdminDashboard;
