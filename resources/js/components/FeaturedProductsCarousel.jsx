import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import api from '../utils/api.js';
import { addCartItem } from '../utils/cart.js';
import { isAuthenticated } from '../utils/auth.js';

export default function FeaturedProductsCarousel({ showControls = true }) {
	const navigate = useNavigate();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const trackRef = useRef(null);

	useEffect(() => {
		let active = true;

		const fetchProducts = async () => {
			setLoading(true);
			setErrorMessage('');

			try {
				const { data } = await api.get('/products');
				const featured = [...data]
					.filter((item) => Number(item.stock) > 0)
					.sort((left, right) => Number(right.id) - Number(left.id))
					.slice(0, 10);

				if (active) {
					setProducts(featured);
				}
			} catch (error) {
				if (active) {
					setErrorMessage(error?.response?.data?.message || 'Failed to load featured products.');
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		fetchProducts();

		return () => {
			active = false;
		};
	}, []);

	const scrollTrack = (direction) => {
		if (!trackRef.current) {
			return;
		}

		trackRef.current.scrollBy({
			left: direction === 'left' ? -320 : 320,
			behavior: 'smooth',
		});
	};

	const handleAddToCart = (product) => {
		if (!isAuthenticated()) {
			window.alert('Please log in first before adding to cart.');
			navigate('/login');
			return;
		}

		addCartItem({
			id: product.id,
			name: product.name,
			price: Number(product.price),
			size: String(product.size || product.sizes?.[0] || 'N/A'),
			quantity: 1,
			stock: Number(product.stock || 0),
			image: product.image,
		});

		window.alert('Item added to cart.');
	};

	if (loading) {
		return (
			<div className="featured-carousel__state">
				<p>Loading featured products...</p>
			</div>
		);
	}

	if (errorMessage) {
		return (
			<div className="featured-carousel__state featured-carousel__state--error">
				<p>{errorMessage}</p>
			</div>
		);
	}

	if (products.length === 0) {
		return (
			<div className="featured-carousel__state">
				<p>No featured products available right now.</p>
			</div>
		);
	}

	return (
		<div className={`featured-carousel ${showControls ? '' : 'featured-carousel--no-controls'}`}>
			{showControls ? (
				<button
					type="button"
					className="featured-carousel__arrow featured-carousel__arrow--left"
					onClick={() => scrollTrack('left')}
					aria-label="Scroll featured products left"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<path d="m15 18-6-6 6-6" />
					</svg>
				</button>
			) : null}

			<div className="featured-carousel__track" ref={trackRef}>
				{products.map((product) => (
					<div className="featured-carousel__item" key={product.id}>
						<ProductCard product={product} showAddToCart onAddToCart={handleAddToCart} />
					</div>
				))}
			</div>

			{showControls ? (
				<button
					type="button"
					className="featured-carousel__arrow featured-carousel__arrow--right"
					onClick={() => scrollTrack('right')}
					aria-label="Scroll featured products right"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<path d="m9 18 6-6-6-6" />
					</svg>
				</button>
			) : null}
		</div>
	);
}
