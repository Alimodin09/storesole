import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { clearAuthUser } from '../utils/auth.js';

export default function AdminLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const navigate = useNavigate();

	const handleLogout = () => {
		clearAuthUser();
		navigate('/admin/login');
	};

	return (
		<div className="layout layout--admin">
			<Navbar />
			<div className="admin-container">
				<aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
					<div className="admin-sidebar__header">
						<h2 className="admin-sidebar__title">SoleStore Admin</h2>
						<button
							className="sidebar-toggle"
							onClick={() => setSidebarOpen(!sidebarOpen)}
							aria-label="Toggle sidebar"
						>
							☰
						</button>
					</div>

					<nav className="admin-sidebar__nav" aria-label="Admin navigation">
						<NavLink
							to="/admin/dashboard"
							className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
						>
							Dashboard
						</NavLink>
						<NavLink
							to="/admin/products"
							className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
						>
							Products
						</NavLink>
						<NavLink
							to="/admin/orders"
							className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
						>
							Orders
						</NavLink>
						<hr className="admin-sidebar__divider" />
						<button type="button" className="admin-sidebar__link logout-btn" onClick={handleLogout}>
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
