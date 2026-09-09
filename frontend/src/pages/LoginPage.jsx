import {
    useEffect,
    useState,
} from 'react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();

    const {
        login,
        isAuthenticated,
    } = useAuth();

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', {
                replace: true,
            });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');

        if (!form.email.trim() || !form.password) {
            setError(
                'Email dan password wajib diisi.'
            );
            return;
        }

        try {
            setLoading(true);

            await login(
                form.email,
                form.password
            );

            navigate('/dashboard', {
                replace: true,
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                'Gagal terhubung ke server.';

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <div className="brand-icon">
                        MC
                    </div>

                    <div>
                        <h1>Mini Clinic</h1>
                        <p>Information System</p>
                    </div>
                </div>

                <div className="login-heading">
                    <h2>Masuk ke Sistem</h2>

                    <p>
                        Masukkan akun Anda untuk
                        mengakses layanan klinik.
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="nama@email.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Masukkan password"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? 'Memproses...'
                            : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;