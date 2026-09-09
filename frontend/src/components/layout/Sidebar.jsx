import {
    LayoutDashboard,
    LogOut,
    Stethoscope,
    Users,
} from 'lucide-react';

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <Stethoscope size={24} />
                </div>

                <div>
                    <h2>Mini Clinic</h2>
                    <span>Information System</span>
                </div>
            </div>

            <div className="sidebar-user">
                <div className="user-avatar">
                    {user?.name
                        ?.charAt(0)
                        ?.toUpperCase() || 'U'}
                </div>

                <div>
                    <strong>{user?.name}</strong>
                    <span>{user?.role}</span>
                </div>
            </div>

            <nav className="sidebar-menu">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? 'active' : ''
                        }`
                    }
                >
                    <LayoutDashboard size={19} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/patients"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? 'active' : ''
                        }`
                    }
                >
                    <Users size={19} />
                    <span>Data Pasien</span>
                </NavLink>

            </nav>

            <button
                type="button"
                className="sidebar-logout"
                onClick={logout}
            >
                <LogOut size={19} />
                <span>Logout</span>
            </button>
        </aside>
    );
};

export default Sidebar;