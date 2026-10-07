const getToken = () => {
    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );
};

const getUser = () => {
    const storedUser =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

    return storedUser
        ? JSON.parse(storedUser)
        : null;
};

const setAuth = (token, user, rememberMe = true) => {
    // Clear previous authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    const storage = rememberMe
        ? localStorage
        : sessionStorage;

    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(user));
};

const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
};

export {
    getToken,
    getUser,
    setAuth,
    clearAuth,
};