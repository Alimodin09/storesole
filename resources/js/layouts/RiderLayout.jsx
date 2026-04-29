import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { clearAuthUser } from '../utils/auth.js';

const RIDER_BRAND_LOGO_PATH = '/images/logo/sole-logo.png';

export default function RiderLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuthUser();
        navigate('/rider/login');
    };

    const closeSidebar = () => {
        if (window.innerWidth <= 768) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="layout layout--admin">
            <div className="admin-container">
                <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <div className="admin-sidebar__header">
                        <Link
                            to="/rider/dashboard"
                            className="admin-sidebar__brand"
                            aria-label="Sole rider dashboard"
                            onClick={closeSidebar}
                        >
                            <img src={RIDER_BRAND_LOGO_PATH} alt="Sole logo" className="admin-sidebar__logo" />
                            <h2 className="admin-sidebar__title">Sole Rider</h2>
                        </Link>
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle sidebar"
                            title="Toggle sidebar"
                        >
                            <FiMenu />
                        </button>
                    </div>

                    <nav className="admin-sidebar__nav" aria-label="Rider navigation">
                        <NavLink
                            to="/rider/dashboard"
                            className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            Dashboard
                        </NavLink>
                        <hr className="admin-sidebar__divider" />
                        <button
                            type="button"
                            className="admin-sidebar__link logout-btn"
                            onClick={handleLogout}
                            title="Logout from rider panel"
                        >
                            Logout
                        </button>
                    </nav>
                </aside>

                <main className="admin-main">
                    <div className="admin-main__content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
