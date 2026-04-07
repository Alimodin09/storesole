import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function MainLayout() {
	return (
		<div className="layout layout--main">
			<Navbar />
			<main className="layout__content">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
