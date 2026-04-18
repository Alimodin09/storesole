import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { FiMenu, FiGrid, FiBox, FiShoppingCart, FiLogOut } from 'react-icons/fi';
import Navbar from '../components/Navbar.jsx';
import { clearAuthUser } from '../utils/auth.js';

// Update logo path here if file location changes
const ADMIN_BRAND_LOGO_PATH = '/images/logo/sole-logo.png';

export default function AdminLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const navigate = useNavigate();

	const handleLogout = () => {
		clearAuthUser();
		navigate('/admin/login');
	};

	const closeSidebar = () => {
		if (window.innerWidth <= 768) {
			setSidebarOpen(false);
		}
	};

	return (
		<div className="layout layout--admin">
			<Navbar />
			<div className="admin-container">
				<aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
					<div className="admin-sidebar__header">
						<Link 
							to="/admin/dashboard" 
							className="admin-sidebar__brand" 
							aria-label="Sole admin dashboard"
							onClick={closeSidebar}
						>
							<img src={ADMIN_BRAND_LOGO_PATH} alt="Sole logo" className="admin-sidebar__logo" />
							<h2 className="admin-sidebar__title">Sole Admin</h2>
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

					<nav className="admin-sidebar__nav" aria-label="Admin navigation">
						<NavLink
							to="/admin/dashboard"
							className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
							onClick={closeSidebar}
						>
							Dashboard
						</NavLink>
						<NavLink
							to="/admin/products"
							className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
							onClick={closeSidebar}
						>
							Products
						</NavLink>
						<NavLink
							to="/admin/orders"
							className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
							onClick={closeSidebar}
						>
							Orders
						</NavLink>
						<hr className="admin-sidebar__divider" />
						<button 
							type="button" 
							className="admin-sidebar__link logout-btn" 
							onClick={handleLogout}
							title="Logout from admin panel"
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
