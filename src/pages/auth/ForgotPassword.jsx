import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../../utils/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to send password reset email."
                );
            }

            setSuccess(data.message);
            setEmail("");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-container">

                {/* Left Side */}
                <div className="auth-brand-section">

                    <h1>
                        Community
                        <br />
                        Book Exchange
                    </h1>

                    <p>
                        Share books. Discover new stories.
                        <br />
                        Connect with your community.
                    </p>

                    <div className="auth-brand-feature">
                        <span>✓</span>
                        <span>
                            Exchange books with your community
                        </span>
                    </div>

                    <div className="auth-brand-feature">
                        <span>✓</span>
                        <span>
                            Discover books near you
                        </span>
                    </div>

                    <div className="auth-brand-feature">
                        <span>✓</span>
                        <span>
                            Give your books a new home
                        </span>
                    </div>

                </div>

                {/* Right Side */}
                <div className="auth-form-section">

                    <div className="auth-form-wrapper">

                        <div className="auth-mobile-logo">
                            📚
                        </div>

                        <div className="auth-heading">

                            <h2>Forgot Password?</h2>

                            <p>
                                Enter your email address and
                                we'll send you a password reset link.
                            </p>

                        </div>

                        {error && (
                            <div className="auth-error">
                                <span>⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="auth-success">
                                <span>✓</span>
                                <span>{success}</span>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="auth-form"
                        >

                            <div className="auth-field">

                                <label htmlFor="forgot-email">
                                    Email Address
                                </label>

                                <input
                                    id="forgot-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <button
                                type="submit"
                                className="auth-submit-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Sending..."
                                    : "Send Reset Link"}
                            </button>

                        </form>

                        <p className="auth-switch">
                            Remember your password?{" "}
                            <Link to="/login">
                                Back to Login
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ForgotPassword;