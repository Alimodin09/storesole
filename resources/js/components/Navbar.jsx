import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, ShoppingCart, User, X } from 'lucide-react';
import { getAuthChangedEventName, getAuthUser } from '../utils/auth.js';
import { getCartChangedEventName, getCartCount } from '../utils/cart.js';
import api from '../utils/api.js';

const BRAND_LOGO_PATH = '/images/logo/sole-logo.png';

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchValue, setSearchValue] = useState('');
	const [authUser, setAuthUser] = useState(() => getAuthUser());
	const [cartCount, setCartCount] = useState(() => getCartCount());
	const [isScrolled, setIsScrolled] = useState(false);
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);
	const [orders, setOrders] = useState([]);
	const [notificationLoading, setNotificationLoading] = useState(false);
	const searchWrapperRef = useRef(null);
	const notificationRef = useRef(null);
	const navigate = useNavigate();
	const location = useLocation();

	const isAuthRoute = 
		location.pathname === '/login' ||
		location.pathname === '/signup' ||
		location.pathname === '/forgot-password' ||
		location.pathname.startsWith('/reset-password/');
	const isAdminRoute = location.pathname.startsWith('/admin');
	const isCustomer = authUser?.user?.role === 'customer';

	// Helper to check if menu link is active based on exact query params
	const isMenuLinkActive = (to) => {
		if (location.pathname !== '/products') return false;
		const urlParams = new URLSearchParams(location.search);
		const toParams = new URLSearchParams(to.split('?')[1] || '');
		
		if (to.includes('audience=men')) return urlParams.get('audience') === 'men';
		if (to.includes('audience=women')) return urlParams.get('audience') === 'women';
		if (to.includes('audience=kids')) return urlParams.get('audience') === 'kids';
		if (to.includes('sort=newest')) return urlParams.get('sort') === 'newest';
		return false;
	};

	if (isAdminRoute || isAuthRoute) return null;

	const closeMenu = () => setIsMenuOpen(false);

	const handleSearchSubmit = (event) => {
		event.preventDefault();
		const trimmed = searchValue.trim();
		navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products');
		setSearchValue('');
		setIsSearchOpen(false);
		closeMenu();
	};

	const handleNotificationClick = async () => {
		if (!isCustomer) {
			navigate('/login');
			return;
		}
		
		if (isNotificationOpen) {
			setIsNotificationOpen(false);
			return;
		}

		setIsNotificationOpen(true);
		if (orders.length === 0) {
			setNotificationLoading(true);
			try {
				const { data } = await api.get('/user/orders');
				setOrders(data || []);
			} catch (error) {
				console.error('Failed to fetch orders:', error);
				setOrders([]);
			} finally {
				setNotificationLoading(false);
			}
		}
	};

	const getPendingOrderCount = () => {
		const activeStatuses = ['pending', 'processing', 'ready for pickup'];
		return orders.filter((order) => 
			activeStatuses.includes(String(order.status || '').toLowerCase())
		).length;
	};

	const getRecentOrders = () => {
		const activeStatuses = ['pending', 'processing', 'ready for pickup'];
		return orders.filter((order) => 
			activeStatuses.includes(String(order.status || '').toLowerCase())
		).slice(0, 5);
	};

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 20);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		const handleEscapeKey = (event) => {
			if (event.key === 'Escape' && isSearchOpen) {
				setIsSearchOpen(false);
			}
		};

		const handleOutsideClick = (event) => {
			if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
				if (isSearchOpen) {
					setIsSearchOpen(false);
				}
			}
			if (notificationRef.current && !notificationRef.current.contains(event.target)) {
				if (isNotificationOpen) {
					setIsNotificationOpen(false);
				}
			}
		};

		document.addEventListener('keydown', handleEscapeKey);
		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('keydown', handleEscapeKey);
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [isSearchOpen, isNotificationOpen]);

	useEffect(() => {
		setAuthUser(getAuthUser());
		setCartCount(getCartCount());
		setSearchValue(new URLSearchParams(location.search).get('search') || '');
		closeMenu();
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

	// Helper to map order status to CSS class
	const getStatusClass = (status = '') => {
		const normalizedStatus = String(status).toLowerCase().trim();

		if (normalizedStatus === 'pending') return 'is-pending';
		if (normalizedStatus === 'processing') return 'is-processing';
		if (normalizedStatus === 'ready for pickup') return 'is-ready';
		if (normalizedStatus === 'delivered') return 'is-delivered';
		if (normalizedStatus === 'completed') return 'is-completed';

		return 'is-default';
	};

	return (
		<header className={`navbar ${isScrolled ? 'is-scrolled' : ''}`}>
			<div className="navbar__container">
				{/* Logo */}
				<div className="navbar__logo">
					<button 
						type="button" 
						className="navbar__logo-btn"
						onClick={() => navigate('/')}
						aria-label="Go to homepage"
					>
						<img src={BRAND_LOGO_PATH} alt="Sole" className="navbar__logo-img" />
						<span className="navbar__logo-text">Sole</span>
					</button>
				</div>

				{/* Menu */}
				<nav className="navbar__menu" aria-label="Main navigation">
					<NavLink 
						to="/products?audience=men" 
					className={`navbar__menu-link ${isMenuLinkActive('/products?audience=men') ? 'is-active' : ''}`}
				>
					Men
				</NavLink>
				<NavLink 
					to="/products?audience=women" 
					className={`navbar__menu-link ${isMenuLinkActive('/products?audience=women') ? 'is-active' : ''}`}
				>
					Women
				</NavLink>
				<NavLink 
					to="/products?audience=kids" 
					className={`navbar__menu-link ${isMenuLinkActive('/products?audience=kids') ? 'is-active' : ''}`}
				>
					Kids
				</NavLink>
				<NavLink 
					to="/products?sort=newest" 
					className={`navbar__menu-link ${isMenuLinkActive('/products?sort=newest') ? 'is-active' : ''}`}
				>
					New Arrivals
				</NavLink>
			</nav>

			{/* Actions */}
			<div className="navbar__actions">
				{/* Search */}
			<div className={`navbar__search-wrapper ${isSearchOpen ? 'is-open' : ''}`} ref={searchWrapperRef}>
			{!isSearchOpen && (
				<button
					type="button"
					className="navbar__search-btn"
					onClick={() => setIsSearchOpen(!isSearchOpen)}
					aria-label="Search products"
					aria-expanded={isSearchOpen}
				>
					<Search size={20} strokeWidth={2.2} />
				</button>
			)}

				{isSearchOpen && (
					<form className="navbar__search-form" onSubmit={handleSearchSubmit}>
						<Search size={18} strokeWidth={2.2} className="navbar__search-form-icon" />
						<input
							type="search"
							className="navbar__search-form-input"
							placeholder="Search shoes..."
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							autoFocus
							aria-label="Search products"
						/>
					</form>
				)}
			</div>

			{/* Notification Icon */}
			<div className="navbar__notification-wrapper" ref={notificationRef}>
				<button
					type="button"
					className="navbar__icon-btn navbar__notification-btn"
					onClick={handleNotificationClick}
					aria-label="Order notifications"
					aria-expanded={isNotificationOpen}
				>
					<Bell size={20} strokeWidth={2} />
					{getPendingOrderCount() > 0 && (
						<span className="navbar__badge navbar__badge--notification">
							{getPendingOrderCount() > 9 ? '9+' : getPendingOrderCount()}
						</span>
					)}
				</button>

				{isNotificationOpen && isCustomer && (
					<div className="navbar__notification-dropdown">
						<div className="navbar__notification-header">
							<h3>Order Updates</h3>
						</div>
						<div className="navbar__notification-content">
							{notificationLoading ? (
								<div className="navbar__notification-loading">Loading...</div>
							) : getRecentOrders().length > 0 ? (
								<ul className="navbar__notification-list">
									{getRecentOrders().map((order) => (
										<li key={order.id} className="navbar__notification-item">
											<div className="navbar__notification-item-header">
												<span className="navbar__notification-order-num">Order #{order.id}</span>
												<span className={`navbar__notification-status ${getStatusClass(order.status)}`}>
													{order.status}
												</span>
											</div>
											<p className="navbar__notification-item-text">
												{order.status === 'Pending' && 'Your order is being prepared.'}
												{order.status === 'Processing' && 'Your order is being processed.'}
												{order.status === 'Ready for Pickup' && 'Your order is ready for pickup!'}
											</p>
											<button
												type="button"
												className="navbar__notification-link"
												onClick={() => {
													navigate('/orders');
													setIsNotificationOpen(false);
												}}
											>
												View Order
											</button>
										</li>
									))}
								</ul>
							) : (
								<div className="navbar__notification-empty">No order updates yet.</div>
							)}
						</div>
						<div className="navbar__notification-footer">
							<button
								type="button"
								className="navbar__notification-view-all"
								onClick={() => {
									navigate('/orders');
									setIsNotificationOpen(false);
								}}
							>
								View All Orders
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Cart Icon Button */}
			<NavLink
				to="/cart"
				className="navbar__icon-btn navbar__cart-btn"
				aria-label="Shopping cart"
			>
					<ShoppingCart size={20} strokeWidth={2} />
					{cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
				</NavLink>

				{/* Profile / Auth Section */}
				{isCustomer ? (
					<button
						type="button"
						className="navbar__icon-btn navbar__profile-btn"
						onClick={() => navigate('/profile')}
						aria-label="Profile"
					>
						<User size={20} strokeWidth={2} />
					</button>
				) : (
					<div className="navbar__auth-buttons">
						<NavLink
							to="/login"
							className="navbar__auth-btn navbar__login-btn"
						>
							Login
						</NavLink>
						<NavLink
							to="/signup"
							className="navbar__auth-btn navbar__signup-btn"
						>
							Sign Up
						</NavLink>
					</div>
				)}

				{/* Mobile Menu Toggle */}
				<button 
					type="button"
					className={`navbar__mobile-toggle ${isMenuOpen ? 'is-active' : ''}`}
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					aria-label="Toggle menu"
					aria-expanded={isMenuOpen}
				>
					<span></span>
					<span></span>
					<span></span>
				</button>
			</div>
			</div>

			{/* Mobile Menu */}
			{isMenuOpen && (
				<div className="navbar__mobile-menu">
					<nav className="navbar__mobile-nav">
						<NavLink 
							to="/products?audience=men"
							className="navbar__mobile-link"
							onClick={closeMenu}
						>
							Men
						</NavLink>
						<NavLink 
							to="/products?audience=women"
							className="navbar__mobile-link"
							onClick={closeMenu}
						>
							Women
						</NavLink>
						<NavLink 
							to="/products?audience=kids"
							className="navbar__mobile-link"
							onClick={closeMenu}
						>
							Kids
						</NavLink>
						<NavLink 
							to="/products?sort=newest"
							className="navbar__mobile-link"
							onClick={closeMenu}
						>
							New Arrivals
						</NavLink>

						{isCustomer && (
							<NavLink 
								to="/profile"
								className="navbar__mobile-link"
								onClick={closeMenu}
							>
								Profile
							</NavLink>
						)}

						<NavLink 
							to="/cart"
							className="navbar__mobile-link"
							onClick={closeMenu}
						>
							Cart {cartCount > 0 && `(${cartCount})`}
						</NavLink>

						{!isCustomer && (
							<NavLink 
								to="/login"
								className="navbar__mobile-link"
								onClick={closeMenu}
							>
								Login
							</NavLink>
						)}
					</nav>
				</div>
			)}
		</header>
	);
}




