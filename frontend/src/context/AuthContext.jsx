
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    loginUser,
    registerUser,
    getCurrentUser,
} from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setUser(null);
    }, []);

    const login = useCallback(async (credentials) => {
        const data = await loginUser(credentials);

        if (!data.success || !data.token || !data.user) {
            throw new Error("Invalid login response.");
        }

        localStorage.setItem("token", data.token);
        setUser(data.user);

        return data.user;
    }, []);

    const register = useCallback(async (userData) => {
        return registerUser(userData);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getCurrentUser();

                if (!data.success || !data.user) {
                    throw new Error("Unable to restore session.");
                }

                if (!cancelled) {
                    setUser(data.user);
                }
            } catch {
                localStorage.removeItem("token");

                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        restoreSession();

        return () => {
            cancelled = true;
        };
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider."
        );
    }

    return context;
}
