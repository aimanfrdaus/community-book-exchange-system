import {
    createContext,
    useContext,
    useState
} from "react";

import {
    getUser,
    setAuth,
    clearAuth
} from "../utils/authStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        return getUser();
    });

    const login = (
        token,
        userData,
        rememberMe = true
    ) => {
        setAuth(
            token,
            userData,
            rememberMe
        );

        setUser(userData);
    };

    const logout = () => {
        clearAuth();

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};