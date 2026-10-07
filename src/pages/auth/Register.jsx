import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import API_URL from "../../utils/api";

const Register = () => {
    const { login } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [location, setLocation] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
}

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        location,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed."
                );
            }

            setSuccess("Registration successful!");

            setName("");
            setEmail("");
            setPassword("");
            setLocation("");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

const handleGoogleSignup = async (credentialResponse) => {
    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
        const response = await fetch(
            `${API_URL}/api/auth/google`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credential:
                        credentialResponse.credential,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Google signup failed."
            );
        }

        login(data.token, data.user);

        if (data.user.role === "admin") {
            navigate("/admin/dashboard");
        } else {
            navigate("/dashboard");
        }

    } catch (err) {
        setError(err.message);
    } finally {
        setGoogleLoading(false);
    }
};

    return (
        <div className="auth-page">

            <div className="auth-container">

                {/* Left Side */}
                <div className="auth-brand-section">

                    <img
                        src="/logo.png"
                        alt="Community Book Exchange System"
                        className="auth-brand-logo-register"
                    />

                    <h1>
                        Join the
                        <br />
                        Community Book Exchange System
                    </h1>

                    <p>
                        Turn books you no longer need
                        <br />
                        into new reading experiences.
                    </p>

                    <div className="auth-brand-feature">
                        <span>✓</span>
                        <span>List books you want to exchange</span>
                    </div>

                    <div className="auth-brand-feature">
                        <span>✓</span>
                        <span>Find books from nearby users</span>
                    </div>

                    <div className="auth-brand-feature">
                        <span>✓</span>
                        <span>Build a stronger reading community</span>
                    </div>

                </div>

                {/* Right Side */}
                <div className="auth-form-section">

                    <div className="auth-form-wrapper">

                        <div className="auth-mobile-logo">
                            📚
                        </div>

                        <div className="auth-heading">
                            <h2>Create an Account</h2>

                            <p>
                                Register to start exchanging books.
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
                            onSubmit={handleRegister}
                            className="auth-form"
                        >

                            <div className="auth-field">

                                <label htmlFor="register-name">
                                    Full Name
                                </label>

                                <input
                                    id="register-name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <div className="auth-field">

                                <label htmlFor="register-email">
                                    Email Address
                                </label>

                                <input
                                    id="register-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <div className="auth-field">

                                <label htmlFor="register-password">
                                    Password
                                </label>

<div className="password-input-wrapper">

    <input
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
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

                                <label htmlFor="register-confirm-password">
                                    Confirm Password
                                </label>

                                <div className="password-input-wrapper">

                                    <input
                                        id="register-confirm-password"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
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

                            <div className="auth-field">

                                <label htmlFor="register-location">
                                    Location
                                </label>

                                <input
                                    id="register-location"
                                    type="text"
                                    placeholder="e.g. Kuala Terengganu"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(e.target.value)
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
                                    ? "Creating Account..."
                                    : "Create Account"}
                            </button>

                        </form>

<div className="auth-divider">
    <span>OR</span>
</div>

<div className="google-login-container">
    <GoogleLogin
        onSuccess={handleGoogleSignup}
        onError={() =>
            setError(
                "Google signup was unsuccessful."
            )
        }
        useOneTap={false}
        width="100%"
    />
</div>

{googleLoading && (
    <p className="google-loading">
        Signing up with Google...
    </p>
)}

<p className="auth-switch">
                            Already have an account?{" "}
                            <Link to="/login">
                                Login
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Register;
