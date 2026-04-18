import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api.js';
import { addCartItem } from '../utils/cart.js';
import { formatPeso, getProductImageUrl } from '../utils/format.js';
import { isAuthenticated } from '../utils/auth.js';

const trustItems = [
	{ label: 'Free Delivery', text: 'On orders over P1,000.' },
	{ label: 'Easy Returns', text: '30-day return support.' },
	{ label: 'Secure Payment', text: 'Safe checkout protection.' }
];

export default function ProductDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [product, setProduct] = useState(null);
	const [quantity, setQuantity] = useState(1);
	const [selectedSize, setSelectedSize] = useState('');
	const [activeImage, setActiveImage] = useState('');
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let active = true;

		const fetchProduct = async () => {
			setLoading(true);
			setErrorMessage('');

			try {
				const { data } = await api.get(`/products/${id}`);
				if (active) setProduct(data);
			} catch (error) {
				if (active) setErrorMessage(error?.response?.data?.message || 'Unable to load product details.');
			} finally {
				if (active) setLoading(false);
			}
		};

		fetchProduct();
		return () => { active = false; };
	}, [id]);

	const productImages = useMemo(() => {
		if (!product) return [];

		const relationImages = Array.isArray(product.product_images) ? product.product_images.map((item) => item.image_path) : [];
		const baseImages = Array.isArray(product.image_paths) ? product.image_paths : [];
		return [...new Set([product.image, ...baseImages, ...relationImages].filter(Boolean))];
	}, [product]);

	useEffect(() => {
		if (productImages.length === 0) {
			setActiveImage('');
			return;
		}

		setActiveImage((current) => (current && productImages.includes(current) ? current : productImages[0]));
	}, [productImages]);

	const availableSizes = useMemo(() => {
		if (!product) return [];
		if (Array.isArray(product.sizes) && product.sizes.length > 0) return product.sizes;
		if (product.size) return [product.size];
		return [];
	}, [product]);

	useEffect(() => {
		if (availableSizes.length > 0) {
			setSelectedSize(String(availableSizes[0]));
		} else {
			setSelectedSize('');
		}
	}, [availableSizes]);

	const hasMultipleImages = productImages.length > 1;

	const goToImage = (direction) => {
		if (!hasMultipleImages) {
			return;
		}

		setActiveImage((current) => {
			const currentIndex = productImages.indexOf(current);
			const safeIndex = currentIndex >= 0 ? currentIndex : 0;
			const nextIndex = direction === 'next'
				? (safeIndex + 1) % productImages.length
				: (safeIndex - 1 + productImages.length) % productImages.length;

			return productImages[nextIndex];
		});
	};

	const handleAddToCart = () => {
		if (!product) return;

		if (!isAuthenticated()) {
			window.alert('Please log in first before adding to cart.');
			navigate('/login');
			return;
		}

		if (availableSizes.length > 0 && !selectedSize) {
			window.alert('Please select a size.');
			return;
		}

		addCartItem({
			id: product.id,
			name: product.name,
			price: Number(product.price),
			size: selectedSize || product.size || '',
			quantity,
			stock: product.stock,
			image: product.image
		});

		navigate('/cart');
	};

	const handleBuyNow = () => {
		if (!product) return;

		if (!isAuthenticated()) {
			window.alert('Please log in first before checkout.');
			navigate('/login');
			return;
		}

		if (availableSizes.length > 0 && !selectedSize) {
			window.alert('Please select a size.');
			return;
		}

		addCartItem({
			id: product.id,
			name: product.name,
			price: Number(product.price),
			size: selectedSize || product.size || '',
			quantity,
			stock: product.stock,
			image: product.image
		});

		navigate('/checkout');
	};

	if (loading) {
		return (
			<section className="page page--product-detail">
				<div className="container">
					<div className="products-empty">
						<h3>Loading product...</h3>
					</div>
				</div>
			</section>
		);
	}

	if (errorMessage) {
		return (
			<section className="page page--product-detail">
				<div className="container">
					<div className="products-empty">
						<h3>Unable to load product</h3>
						<p>{errorMessage}</p>
						<Link to="/products" className="btn btn--primary">Back to Products</Link>
					</div>
				</div>
			</section>
		);
	}

	if (!product) {
		return (
			<section className="page page--product-detail">
				<div className="container">
					<div className="products-empty">
						<h3>Product Not Found</h3>
						<p>Sorry, the product you&apos;re looking for does not exist.</p>
						<Link to="/products" className="btn btn--primary">Back to Products</Link>
					</div>
				</div>
			</section>
		);
	}

	const displayImage = activeImage || product.image;
	const imageUrl = getProductImageUrl(displayImage);

	return (
		<section className="page page--product-detail storefront-product-detail">
			<div className="container product-detail-container">
				<div className="storefront-product-detail__topbar">
					<Link to="/products" className="storefront-product-detail__back-btn">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="m15 18-6-6 6-6" />
						</svg>
						<span>Back</span>
					</Link>
				</div>

				<div className="product-detail-grid">
					<div className="product-image-section">
						<div className="storefront-product-detail__gallery">
							{productImages.length > 1 ? (
								<div className="product-thumbnails product-thumbnails--vertical">
									{productImages.map((imagePath, index) => (
										<button
											type="button"
											key={`${imagePath}-${index}`}
											className={`product-thumbnail-btn ${activeImage === imagePath ? 'active' : ''}`}
											onClick={() => setActiveImage(imagePath)}
											aria-label={`View image ${index + 1}`}
										>
											<img
												src={getProductImageUrl(imagePath)}
												alt={`${product.name} view ${index + 1}`}
												onError={(event) => {
													event.currentTarget.src = '/images/carousel/image3.jpg';
												}}
											/>
										</button>
									))}
								</div>
							) : null}

							<div className="product-image-frame">
								{hasMultipleImages ? (
									<>
										<button
											type="button"
											className="product-image-frame__arrow product-image-frame__arrow--prev"
											onClick={() => goToImage('prev')}
											aria-label="Previous image"
										>
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
												<path d="m15 18-6-6 6-6" />
											</svg>
										</button>
										<button
											type="button"
											className="product-image-frame__arrow product-image-frame__arrow--next"
											onClick={() => goToImage('next')}
											aria-label="Next image"
										>
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
												<path d="m9 18 6-6-6-6" />
											</svg>
										</button>
									</>
								) : null}
								<img
									src={imageUrl}
									alt={product.name}
									className="product-image"
									loading="eager"
									onError={(event) => {
										event.currentTarget.src = '/images/carousel/image3.jpg';
									}}
								/>
							</div>
						</div>
					</div>

					<div className="product-info-section">
						<h1>{product.name}</h1>

						<div className="storefront-product-detail__rating">
							<span>4.8</span>
							<span>★★★★★</span>
							<span>(24 reviews)</span>
						</div>

						<p className="product-description">
							{product.description || 'Quality school shoes designed for comfort and durability.'}
						</p>

						<div className="product-price">
							<span className="price">{formatPeso(product.price)}</span>
							<span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
								{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
							</span>
						</div>

						<div className="product-options">
							<div className="size-selector">
								<label>Available Size</label>
								<div className="sizes">
									{availableSizes.length > 0 ? availableSizes.map((size) => (
										<button
											type="button"
											key={size}
											className={`size-btn ${selectedSize === String(size) ? 'active' : ''}`}
											onClick={() => setSelectedSize(String(size))}
										>
											{size}
										</button>
									)) : (
										<span className="size-note">One size only</span>
									)}
								</div>
							</div>

							<div className="quantity-selector">
								<label>Quantity</label>
								<div className="quantity-input">
									<button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
									<input type="number" value={quantity} readOnly />
									<button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
								</div>
							</div>
						</div>

						<div className="storefront-product-detail__actions">
							<button type="button" className="btn btn--primary storefront-product-detail__action-btn" onClick={handleAddToCart} disabled={product.stock === 0}>Add to Cart</button>
							<button type="button" className="storefront-product-detail__buy-btn" onClick={handleBuyNow} disabled={product.stock === 0}>Buy Now</button>
						</div>

						<div className="storefront-product-detail__trust-row">
							{trustItems.map((item) => (
								<div key={item.label} className="storefront-product-detail__trust-item">
									<strong>{item.label}</strong>
									<span>{item.text}</span>
								</div>
							))}
						</div>

						<div className="product-summary-grid">
							<div className="summary-card">
								<span className="summary-label">Price</span>
								<strong>{formatPeso(product.price)}</strong>
							</div>
							<div className="summary-card">
								<span className="summary-label">Stock</span>
								<strong>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</strong>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}