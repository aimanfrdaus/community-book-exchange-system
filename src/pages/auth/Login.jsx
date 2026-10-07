import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import API_URL from "../../utils/api";

const Login = () => {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed."
                );
            }

            login(
                data.token,
                data.user,
                rememberMe
            );

            if (data.user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard");
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        setError("");
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
                    "Google login failed."
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
                        className="auth-brand-logo"
                    />

                    <h1>
                        Community
                        <br />
                        Book Exchange System
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

                            <h2>Welcome Back</h2>

                            <p>
                                Sign in to continue to your account.
                            </p>

                        </div>

                        {error && (
                            <div className="auth-error">
                                <span>⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form
                            onSubmit={handleLogin}
                            className="auth-form"
                        >

                            <div className="auth-field">

                                <label htmlFor="login-email">
                                    Email Address
                                </label>

                                <input
                                    id="login-email"
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

                                <label htmlFor="login-password">
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

                            <div className="login-options">

                                <div className="remember-me">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) =>
                                                setRememberMe(e.target.checked)
                                            }
                                        />

                                        <span>Remember Me</span>
                                    </label>
                                </div>

                                <Link
                                    to="/forgot-password"
                                    className="forgot-password-link"
                                >
                                    Forgot Password?
                                </Link>

                            </div>

                            <button
                                type="submit"
                                className="auth-submit-button"
                                disabled={
                                    loading ||
                                    googleLoading
                                }
                            >
                                {loading
                                    ? "Logging in..."
                                    : "Login"}
                            </button>

                        </form>

                        <div className="auth-divider">
                            <span>OR</span>
                        </div>

                        <div className="google-login-container">

                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() =>
                                    setError(
                                        "Google login was unsuccessful."
                                    )
                                }
                                useOneTap={false}

                            />

                        </div>

                        {googleLoading && (
                            <p className="google-loading">
                                Signing in with Google...
                            </p>
                        )}

                        <p className="auth-switch">
                            Don't have an account?{" "}
                            <Link to="/register">
                                Create an account
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;