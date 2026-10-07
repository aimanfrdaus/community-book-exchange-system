import { useEffect, useState } from "react";
import API_URL from "../../utils/api";

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedReport, setSelectedReport] =
        useState(null);

    const [selectedStatus, setSelectedStatus] =
        useState("");

    const [updating, setUpdating] =
        useState(false);

    const [updateError, setUpdateError] =
        useState("");

    const [showSuccessModal, setShowSuccessModal] =
    useState(false);    

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/reports/admin`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to retrieve reports."
                );
            }

            setReports(data.reports || []);

        } catch (err) {
            setError(err.message);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports = reports.filter((report) => {
    const matchesStatus =
        statusFilter === "All" ||
        report.status === statusFilter;

    const search = searchTerm.toLowerCase();

    const matchesSearch =
        (report.reporter_name || "")
            .toLowerCase()
            .includes(search) ||
        (report.reported_user_name || "")
            .toLowerCase()
            .includes(search) ||
        (report.book_title || "")
            .toLowerCase()
            .includes(search) ||
        (report.reason || "")
            .toLowerCase()
            .includes(search);

    return matchesStatus && matchesSearch;
});

const totalReports = reports.length;

const pendingReports = reports.filter(
    (report) => report.status === "Pending"
).length;

const reviewedReports = reports.filter(
    (report) => report.status === "Reviewed"
).length;

const resolvedReports = reports.filter(
    (report) => report.status === "Resolved"
).length;

const rejectedReports = reports.filter(
    (report) => report.status === "Rejected"
).length;

    const openReviewModal = (report) => {
        setSelectedReport(report);
        setSelectedStatus(report.status);
        setUpdateError("");
    };

    const closeReviewModal = () => {
        if (updating) {
            return;
        }

        setSelectedReport(null);
        setSelectedStatus("");
        setUpdateError("");
    };

    const handleUpdateStatus = async () => {

        if (!selectedReport) {
            return;
        }

        if (!selectedStatus) {
            setUpdateError(
                "Please select a status."
            );

            return;
        }

        try {
            setUpdating(true);
            setUpdateError("");

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/reports/admin/${selectedReport.report_id}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        status: selectedStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update report status."
                );
            }

                    setReports((currentReports) =>
                        currentReports.map((report) =>
                            report.report_id ===
                            selectedReport.report_id
                                ? {
                                    ...report,
                                    status: selectedStatus,
                                }
                                : report
                        )
                    );

                    setSelectedReport(null);
                    setSelectedStatus("");
                    setUpdateError("");

                    setShowSuccessModal(true);

        } catch (err) {
            setUpdateError(err.message);

        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="admin-report-page">

            {/* PAGE HEADER */}
            <div className="admin-page-header">

                <div>
                    <h1>
                        Report Management
                    </h1>

                    <p>
                        Review reports submitted by
                        users.
                    </p>
                </div>

            </div>

            {/* REPORT SUMMARY */}
<div className="report-summary-grid">

    <div className="report-summary-card is-total">
        <span>Total Reports</span>
        <strong>{totalReports}</strong>
    </div>

    <div className="report-summary-card is-pending">
        <span>Pending</span>
        <strong>{pendingReports}</strong>
    </div>

    <div className="report-summary-card is-reviewed">
        <span>Reviewed</span>
        <strong>{reviewedReports}</strong>
    </div>

    <div className="report-summary-card is-resolved">
        <span>Resolved</span>
        <strong>{resolvedReports}</strong>
    </div>

    <div className="report-summary-card is-rejected">
        <span>Rejected</span>
        <strong>{rejectedReports}</strong>
    </div>

</div>

{/* REPORT FILTERS */}
<div className="report-filter-section">

    <div className="report-search-box">

        <input
            type="text"
            placeholder="Search reporter, owner, book or reason..."
            value={searchTerm}
            onChange={(e) =>
                setSearchTerm(e.target.value)
            }
        />

    </div>

    <div className="report-status-filter">

        <select
            value={statusFilter}
            onChange={(e) =>
                setStatusFilter(e.target.value)
            }
        >
            <option value="All">
                All Reports
            </option>

            <option value="Pending">
                Pending
            </option>

            <option value="Reviewed">
                Reviewed
            </option>

            <option value="Resolved">
                Resolved
            </option>

            <option value="Rejected">
                Rejected
            </option>
        </select>

    </div>

</div>


            {/* LOADING */}
            {loading && (
                <div className="admin-report-message">
                    <p>
                        Loading reports...
                    </p>
                </div>
            )}


            {/* ERROR */}
            {!loading && error && (
                <div className="admin-report-error">
                    {error}
                </div>
            )}


            {/* NO REPORTS */}
            {!loading &&
                !error &&
                reports.length === 0 && (
                    <div className="admin-report-empty">

                        <div className="admin-report-empty-icon">
                            ✓
                        </div>

                        <h2>
                            No Reports
                        </h2>

                        <p>
                            There are currently no
                            reports submitted by
                            users.
                        </p>

                    </div>
                )}


            {/* REPORT LIST */}
            {!loading &&
                !error &&
                filteredReports.length > 0 && (
                    <div className="admin-report-list">

                        {filteredReports.map((report) => (
                            <div
                                className="admin-report-card"
                                key={
                                    report.report_id
                                }
                            >

                                {/* CARD HEADER */}
                                <div className="admin-report-card-header">

                                    <div>
                                        <h2>
                                            Report #
                                            {
                                                report.report_id
                                            }
                                        </h2>

                                        <p>
                                            Submitted on{" "}
                                            {new Date(
                                                report.created_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <span
                                        className={`admin-report-status status-${report.status.toLowerCase()}`}
                                    >
                                        {
                                            report.status
                                        }
                                    </span>

                                </div>


                                {/* REPORT DETAILS */}
                                <div className="admin-report-details">

                                    <div>
                                        <span>
                                            Reporter
                                        </span>

                                        <strong>
                                            {
                                                report.reporter_name
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Reported Owner
                                        </span>

                                        <strong>
                                            {
                                                report.reported_user_name
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Book
                                        </span>

                                        <strong>
                                            {
                                                report.book_title ||
                                                "Book no longer available"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Reason
                                        </span>

                                        <strong>
                                            {
                                                report.reason
                                            }
                                        </strong>
                                    </div>

                                </div>


                                {/* DESCRIPTION */}
                                <div className="admin-report-description">

                                    <span>
                                        Description
                                    </span>

                                    <p>
                                        {
                                            report.description ||
                                            "No additional description provided."
                                        }
                                    </p>

                                </div>


                                {/* ACTION */}
                                <div className="admin-report-actions">

                                    <button
                                        type="button"
                                        className="admin-primary-button"
                                        onClick={() =>
                                            openReviewModal(
                                                report
                                            )
                                        }
                                    >
                                        Review Report
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

                {!loading &&
    !error &&
    reports.length > 0 &&
    filteredReports.length === 0 && (
        <div className="admin-report-empty">

            <div className="admin-report-empty-icon">
                🔍
            </div>

            <h2>
                No Matching Reports
            </h2>

            <p>
                No reports match your current
                search or status filter.
            </p>

        </div>
    )}


            {/* REVIEW MODAL */}
            {selectedReport && (
                <div
                    className="report-review-overlay"
                    onClick={closeReviewModal}
                >

                    <div
                        className="report-review-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="report-review-header">

                            <div>
                                <h2>
                                    Review Report #
                                    {
                                        selectedReport.report_id
                                    }
                                </h2>

                                <p>
                                    Review the report
                                    information and update
                                    its status.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="report-review-close"
                                onClick={
                                    closeReviewModal
                                }
                                disabled={updating}
                            >
                                ×
                            </button>

                        </div>


                        {/* REPORT INFORMATION */}
                        <div className="report-review-information">

                            <div>
                                <span>
                                    Reporter
                                </span>

                                <strong>
                                    {
                                        selectedReport.reporter_name
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Reported Owner
                                </span>

                                <strong>
                                    {
                                        selectedReport.reported_user_name
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Book
                                </span>

                                <strong>
                                    {
                                        selectedReport.book_title ||
                                        "Book no longer available"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Reason
                                </span>

                                <strong>
                                    {
                                        selectedReport.reason
                                    }
                                </strong>
                            </div>

                        </div>


                        {/* DESCRIPTION */}
                        <div className="report-review-description">

                            <span>
                                Description
                            </span>

                            <p>
                                {
                                    selectedReport.description ||
                                    "No additional description provided."
                                }
                            </p>

                        </div>


                        {/* STATUS */}
                        <div className="report-review-status-field">

                            <label>
                                Report Status
                            </label>

                            <select
                                value={
                                    selectedStatus
                                }
                                onChange={(e) =>
                                    setSelectedStatus(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    updating
                                }
                            >

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Reviewed">
                                    Reviewed
                                </option>

                                <option value="Resolved">
                                    Resolved
                                </option>

                                <option value="Rejected">
                                    Rejected
                                </option>

                            </select>

                        </div>


                        {/* ERROR */}
                        {updateError && (
                            <div className="report-review-error">
                                {updateError}
                            </div>
                        )}


                        {/* ACTIONS */}
                        <div className="report-review-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    closeReviewModal
                                }
                                disabled={
                                    updating
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="admin-primary-button"
                                onClick={
                                    handleUpdateStatus
                                }
                                disabled={
                                    updating
                                }
                            >
                                {updating
                                    ? "Updating..."
                                    : "Update Status"}
                            </button>

                        </div>

                    </div>

                </div>

                
            )}

            {/* SUCCESS MODAL */}
{showSuccessModal && (
    <div className="report-success-overlay">
        <div className="report-success-modal">

            <h2>
                Status Updated
            </h2>

            <p>
                The report status has been
                updated successfully.
            </p>

            <button
                type="button"
                className="primary-button"
                onClick={() =>
                    setShowSuccessModal(false)
                }
            >
                OK
            </button>

        </div>
    </div>
)}

        </div>
    );
};

export default ReportManagement;