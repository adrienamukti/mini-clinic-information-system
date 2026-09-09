import {
    createContext,
    useContext,
    useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');

        return storedUser
            ? JSON.parse(storedUser)
            : null;
    });

    const [token, setToken] = useState(() =>
        localStorage.getItem('token')
    );

    const login = async (email, password) => {
        const response = await api.post('/login', {
            email,
            password,
        });

        const {
            token: newToken,
            user: loggedInUser,
        } = response.data.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem(
            'user',
            JSON.stringify(loggedInUser)
        );

        setToken(newToken);
        setUser(loggedInUser);

        return loggedInUser;
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/logout');
            }
        } catch (error) {
            console.error(
                'Logout API error:',
                error
            );
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: Boolean(token),
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