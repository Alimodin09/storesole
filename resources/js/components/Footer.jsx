import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="footer">
			<div className="container footer__inner">
				<div className="footer__section">
					<h4 className="footer__title footer__brand-wordmark">SoleStore</h4>
					<p className="footer__description">
						Your trusted source for quality school shoes. Comfortable, durable, and affordable footwear for students.
					</p>
				</div>

				<div className="footer__section">
					<h4 className="footer__title">Quick Links</h4>
					<ul className="footer__links">
						<li><Link to="/">Home</Link></li>
						<li><Link to="/products">Shop Products</Link></li>
						<li><Link to="/profile">Profile</Link></li>
						<li><a href="#about">About</a></li>
					</ul>
				</div>

				<div className="footer__section">
					<h4 className="footer__title">Contact</h4>
					<ul className="footer__links">
						<li>
							<a href="mailto:support@solestore.com">
								📧 support@solestore.com
							</a>
						</li>
						<li>
							<a href="tel:+1234567890">
								📞 (123) 456-7890
							</a>
						</li>
						<li>📍 123 School Ave, City, State</li>
					</ul>
				</div>
			</div>

			<div className="footer__bottom">
				<p>&copy; {currentYear} SoleStore. All rights reserved.</p>
			</div>
		</footer>
	);
}
