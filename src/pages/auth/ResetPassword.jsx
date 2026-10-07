import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import API_URL from "../../utils/api";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [checkingToken, setCheckingToken] = useState(true);
    const [validToken, setValidToken] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/auth/validate-reset-token/${token}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Invalid or expired password reset link."
                    );
                }

                setValidToken(true);

            } catch (err) {
                setError(err.message);
                setValidToken(false);

            } finally {
                setCheckingToken(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (password.length < 6) {
            setError(
                "Password must be at least 6 characters long."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/reset-password/${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to reset password."
                );
            }

            setSuccess(data.message);
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

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

                            <h2>
                                {checkingToken
                                    ? "Checking Reset Link..."
                                    : validToken
                                        ? "Reset Password"
                                        : "Reset Link Invalid"}
                            </h2>

                            <p>
                                {checkingToken
                                    ? "Please wait while we verify your reset link."
                                    : validToken
                                        ? "Enter your new password below."
                                        : "This password reset link is invalid or has expired."}
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

                        {checkingToken && (
                            <p>
                                Checking your password reset link...
                            </p>
                        )}

                        {!checkingToken &&
                            validToken &&
                            !success && (
                                <form
                                    onSubmit={handleSubmit}
                                    className="auth-form"
                                >

                                    <div className="auth-field">

                                        <label htmlFor="reset-password">
                                            New Password
                                        </label>

<div className="password-input-wrapper">

    <input
        id="reset-password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter your new password"
        value={password}
        onChange={(e) =>
            setPassword(e.target.value)
        }
        required
    />

    <button
        type="button"
        className="password-toggle"
        onClick={() =>
            setShowPassword(!showPassword)
        }
        aria-label={
            showPassword
                ? "Hide password"
                : "Show password"
        }
    >
        {showPassword ? (
            <EyeOff size={20} />
        ) : (
            <Eye size={20} />
        )}
    </button>

</div>

                                    </div>

                                    <div className="auth-field">

                                        <label htmlFor="confirm-password">
                                            Confirm Password
                                        </label>

<div className="password-input-wrapper">

    <input
        id="confirm-password"
        type={
            showConfirmPassword
                ? "text"
                : "password"
        }
        placeholder="Confirm your new password"
        value={confirmPassword}
        onChange={(e) =>
            setConfirmPassword(e.target.value)
        }
        required
    />

    <button
        type="button"
        className="password-toggle"
        onClick={() =>
            setShowConfirmPassword(
                !showConfirmPassword
            )
        }
        aria-label={
            showConfirmPassword
                ? "Hide password"
                : "Show password"
        }
    >
        {showConfirmPassword ? (
            <EyeOff size={20} />
        ) : (
            <Eye size={20} />
        )}
    </button>

</div>

                                    </div>

                                    <button
                                        type="submit"
                                        className="auth-submit-button"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Resetting..."
                                            : "Reset Password"}
                                    </button>

                                </form>
                            )}

                        {!checkingToken &&
                            !validToken && (
                                <Link
                                    to="/forgot-password"
                                    className="auth-submit-button"
                                >
                                    Request a New Reset Link
                                </Link>
                            )}

                        <p className="auth-switch">

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

export default ResetPassword;