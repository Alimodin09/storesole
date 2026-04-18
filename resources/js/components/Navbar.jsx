import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuthChangedEventName, getAuthUser } from '../utils/auth.js';
import { getCartChangedEventName, getCartCount } from '../utils/cart.js';

// Update logo path here if file location changes
const BRAND_LOGO_PATH = '/images/logo/sole-logo.png';

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [openDropdown, setOpenDropdown] = useState('');
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchValue, setSearchValue] = useState('');
	const categoryMenus = ['Men', 'Women', 'Kids'];
	const navigate = useNavigate();
	const location = useLocation();
	const [authUser, setAuthUser] = useState(() => getAuthUser());
	const [cartCount, setCartCount] = useState(() => getCartCount());
	const isAuthRoute =
		location.pathname === '/login' ||
		location.pathname === '/signup' ||
		location.pathname === '/forgot-password' ||
		location.pathname.startsWith('/reset-password/');
	const isAdminRoute = location.pathname.startsWith('/admin');
	const showStorefront = !isAdminRoute;
	const isCustomer = authUser?.user?.role === 'customer';

	// Hide navbar on admin routes
	if (isAdminRoute) {
		return null;
	}

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const handleSearchSubmit = (event) => {
		event.preventDefault();

		const trimmed = searchValue.trim();
		navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products');
		setIsMenuOpen(false);
		setOpenDropdown('');
		setIsSearchOpen(false);
	};

	const handleSearchIconClick = () => {
		if (isSearchOpen && searchValue.trim()) {
			navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
			setIsSearchOpen(false);
			return;
		}

		setIsSearchOpen((prev) => !prev);
	};

	useEffect(() => {
		setAuthUser(getAuthUser());
		setCartCount(getCartCount());
		setSearchValue(new URLSearchParams(location.search).get('search') || '');
		setOpenDropdown('');
		setIsMenuOpen(false);
		setIsSearchOpen(false);
	}, [location.pathname, location.search]);

	useEffect(() => {
		const syncNavbarState = () => {
			setAuthUser(getAuthUser());
			setCartCount(getCartCount());
		};

		const authEvent = getAuthChangedEventName();
		const cartEvent = getCartChangedEventName();

		window.addEventListener(authEvent, syncNavbarState);
		window.addEventListener(cartEvent, syncNavbarState);

		return () => {
			window.removeEventListener(authEvent, syncNavbarState);
			window.removeEventListener(cartEvent, syncNavbarState);
		};
	}, []);

	const handleBrandClick = () => {
		if (isAdminRoute) {
			navigate('/admin/dashboard');
		} else {
			navigate('/');
		}
	};

	if (isAuthRoute) {
		return null;
	}

	return (
		<header className={`navbar ${isAdminRoute ? 'navbar--admin' : 'navbar--storefront'}`}>
			{showStorefront && (
				<div className="navbar__topbar">
					<div className="container navbar__topbar-inner">
						<span className="navbar__topbar-chip">New season arrivals</span>
						<p>Comfort-first school shoes with clean styling, fast checkout, and reliable stock.</p>
						<Link to="/products" className="navbar__topbar-link">Browse collection</Link>
					</div>
				</div>
			)}

			<div className="container navbar__inner">
				<div className="navbar__left">
					<button type="button" onClick={handleBrandClick} className="navbar__brand navbar__brand-button">
						<img src={BRAND_LOGO_PATH} alt="Sole logo" className="navbar__brand-logo" />
						<span className="navbar__brand-text">Sole</span>
					</button>
				</div>

				<nav className="navbar__menu" aria-label="Main navigation">
					{showStorefront && categoryMenus.map((menu) => (
						<div className={`navbar__dropdown ${openDropdown === menu ? 'is-open' : ''}`} key={menu}>
							<button
								type="button"
								className="navbar__link navbar__dropdown-toggle"
								onClick={() => setOpenDropdown(openDropdown === menu ? '' : menu)}
								aria-expanded={openDropdown === menu}
							>
								{menu}
								<span className="navbar__caret">▾</span>
							</button>
							<div className="navbar__dropdown-menu">
								<Link
									to={`/products?audience=${encodeURIComponent(menu.toLowerCase())}`}
									className="navbar__dropdown-item"
									onClick={() => setOpenDropdown('')}
								>
									Shop {menu}
								</Link>
								<Link
									to={`/products?audience=${encodeURIComponent(menu.toLowerCase())}&filter=popular`}
									className="navbar__dropdown-item"
									onClick={() => setOpenDropdown('')}
								>
									Popular in {menu}
								</Link>
							</div>
						</div>
					))}
				</nav>

				<div className="navbar__actions">
					{showStorefront && (
						<div className={`navbar__search-wrap ${isSearchOpen ? 'is-open' : ''}`}>
							<form className="navbar__search-form" onSubmit={handleSearchSubmit}>
								<input
									type="search"
									className="navbar__search-input"
									placeholder="Search shoes"
									value={searchValue}
									onChange={(event) => setSearchValue(event.target.value)}
								/>
							</form>
							<button type="button" className="navbar__icon-btn" onClick={handleSearchIconClick} aria-label="Search products">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<circle cx="11" cy="11" r="7"></circle>
									<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
								</svg>
							</button>
						</div>
					)}

					{showStorefront && (
						<NavLink to="/cart" className="navbar__cart" aria-label="Cart">
							<svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="9" cy="21" r="1"></circle>
								<circle cx="20" cy="21" r="1"></circle>
								<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
							</svg>
							{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
						</NavLink>
					)}

					{showStorefront && isCustomer && (
						<NavLink to="/profile" className="navbar__profile-icon" aria-label="Profile">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="8" r="4"></circle>
								<path d="M4 20a8 8 0 0 1 16 0"></path>
							</svg>
						</NavLink>
					)}

					{showStorefront && authUser ? (
						null
					) : (
						<>
							<NavLink to="/login" className="navbar__login">Login</NavLink>
							<NavLink to="/signup" className="navbar__signup">Sign Up</NavLink>
						</>
					)}
				</div>

				<button className="navbar__mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
					☰
				</button>
			</div>

			{isMenuOpen && (
				<div className="navbar__mobile-menu">
					<nav>
						{showStorefront && (
							<form className="navbar__mobile-search" onSubmit={handleSearchSubmit}>
								<input
									type="search"
									placeholder="Search shoes"
									value={searchValue}
									onChange={(event) => setSearchValue(event.target.value)}
								/>
								<button type="submit" className="navbar__mobile-link navbar__mobile-link-btn">Search</button>
							</form>
						)}
						{showStorefront && isCustomer && <NavLink to="/profile" className="navbar__mobile-link" onClick={() => setIsMenuOpen(false)}>Profile</NavLink>}
						{showStorefront && categoryMenus.map((menu) => (
							<div className="navbar__mobile-group" key={menu}>
								<div className="navbar__mobile-group-title">{menu}</div>
								<NavLink
									to={`/products?audience=${encodeURIComponent(menu.toLowerCase())}`}
									className="navbar__mobile-link"
									onClick={() => setIsMenuOpen(false)}
								>
									Shop {menu}
								</NavLink>
								<NavLink
									to={`/products?audience=${encodeURIComponent(menu.toLowerCase())}&filter=popular`}
									className="navbar__mobile-link"
									onClick={() => setIsMenuOpen(false)}
								>
									Popular in {menu}
								</NavLink>
							</div>
						))}
						{showStorefront && <NavLink to="/cart" className="navbar__mobile-link" onClick={() => setIsMenuOpen(false)}>Cart</NavLink>}
						{showStorefront && authUser ? (
							null
						) : (
							<>
								<NavLink to="/login" className="navbar__mobile-link">Login</NavLink>
								<NavLink to="/signup" className="navbar__mobile-link">Sign Up</NavLink>
							</>
						)}
					</nav>
				</div>
			)}
		</header>
	);
}
