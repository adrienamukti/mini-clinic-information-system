import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    ListOrdered,
    Users,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await api.get('/dashboard');

            setDashboard(response.data.data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    'Gagal mengambil data dashboard.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const cards = [
        {
            title: 'Total Pasien',
            value: dashboard?.total_patients ?? 0,
            icon: Users,
        },
        {
            title: 'Pasien Hari Ini',
            value: dashboard?.patients_today ?? 0,
            icon: CalendarDays,
        },
        {
            title: 'Antrean Hari Ini',
            value: dashboard?.queues_today ?? 0,
            icon: ListOrdered,
        },
        {
            title: 'Pasien Menunggu',
            value: dashboard?.waiting_patients ?? 0,
            icon: Clock3,
        },
        {
            title: 'Selesai Dilayani',
            value:
                dashboard?.completed_patients ?? 0,
            icon: CheckCircle2,
        },
    ];

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <span className="page-eyebrow">
                        Overview
                    </span>

                    <h1>Dashboard</h1>

                    <p>
                        Selamat datang kembali,
                        {' '}
                        <strong>{user?.name}</strong>.
                        Berikut ringkasan pelayanan
                        klinik.
                    </p>
                </div>

                <div className="role-badge">
                    {user?.role}
                </div>
            </header>

            {error && (
                <div className="dashboard-error">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={fetchDashboard}
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            {loading ? (
                <div className="dashboard-loading">
                    Memuat data dashboard...
                </div>
            ) : (
                <section className="stat-grid">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <article
                                className="stat-card"
                                key={card.title}
                            >
                                <div className="stat-icon">
                                    <Icon size={22} />
                                </div>

                                <div>
                                    <span>
                                        {card.title}
                                    </span>

                                    <strong>
                                        {card.value}
                                    </strong>
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}

            <section className="dashboard-info-card">
                <div>
                    <h2>Mini Clinic Information System</h2>

                    <p>
                        Sistem membantu proses
                        pengelolaan pasien,
                        pendaftaran, antrean,
                        pemeriksaan, dan resep obat
                        dalam satu aplikasi.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;