import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function SimpleAuthHeader() {
	const location = useLocation();
	const isLoginPage = location.pathname === '/login';
	const isSignupPage = location.pathname === '/signup';

	return (
		<header className="auth-simple-header">
			<div className="auth-simple-header__container">
				{/* Logo/Brand */}
				<Link to="/" className="auth-simple-header__brand">
					<span className="auth-simple-header__brand-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M3 14.5c2.3-.4 4.9-.6 6.8-.5 2.1.1 4.6.8 7.2 2 1.6.7 3.2.8 4 .8v2.6H3z"></path>
							<path d="M8.2 11.2 12 8.1a2.6 2.6 0 0 1 3 0l1.8 1.4"></path>
						</svg>
					</span>
					<span className="auth-simple-header__brand-text">SoleStore</span>
				</Link>

				{/* Navigation Links */}
				<nav className="auth-simple-header__nav">
					{isLoginPage ? (
						<>
							<span className="auth-simple-header__label">New here?</span>
							<Link to="/signup" className="auth-simple-header__link auth-simple-header__link--primary">
								Create Account
							</Link>
						</>
					) : isSignupPage ? (
						<>
							<span className="auth-simple-header__label">Already joined?</span>
							<Link to="/login" className="auth-simple-header__link auth-simple-header__link--primary">
								Sign In
							</Link>
						</>
					) : null}
					<Link to="/" className="auth-simple-header__link auth-simple-header__link--secondary">
						Back to Home
					</Link>
				</nav>
			</div>
		</header>
	);
}
