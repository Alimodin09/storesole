import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function MainLayout() {
	const location = useLocation();
	const isAuthRoute =
		location.pathname === '/login' ||
		location.pathname === '/signup' ||
		location.pathname === '/forgot-password' ||
		location.pathname.startsWith('/reset-password/');

	return (
		<div className="layout layout--main">
			{!isAuthRoute && <Navbar />}
			<main className="layout__content">
				<Outlet />
			</main>
			{!isAuthRoute && <Footer />}
		</div>
	);
}
