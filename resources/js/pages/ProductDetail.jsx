import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api.js';
import { addCartItem } from '../utils/cart.js';
import { formatPeso, getProductImageUrl } from '../utils/format.js';
import { isAuthenticated } from '../utils/auth.js';

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

				if (active) {
					setProduct(data);
				}
			} catch (error) {
				if (active) {
					setErrorMessage(error?.response?.data?.message || 'Unable to load product details.');
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		fetchProduct();

		return () => {
			active = false;
		};
	}, [id]);

	const productImages = useMemo(() => {
		if (!product) {
			return [];
		}

		const relationImages = Array.isArray(product.product_images)
			? product.product_images.map((item) => item.image_path)
			: [];

		const baseImages = Array.isArray(product.image_paths) ? product.image_paths : [];

		return [...new Set([product.image, ...baseImages, ...relationImages].filter(Boolean))];
	}, [product]);

	const activeImageIndex = useMemo(() => {
		if (!activeImage || productImages.length === 0) return 0;
		return productImages.indexOf(activeImage);
	}, [activeImage, productImages]);

	useEffect(() => {
		if (productImages.length === 0) {
			setActiveImage('');
			return;
		}

		setActiveImage((current) => {
			if (current && productImages.includes(current)) {
				return current;
			}

			return productImages[0];
		});
	}, [productImages]);

	const goToPreviousImage = () => {
		if (productImages.length === 0) return;

		const newIndex = activeImageIndex === 0 ? productImages.length - 1 : activeImageIndex - 1;
		setActiveImage(productImages[newIndex]);
	};

	const goToNextImage = () => {
		if (productImages.length === 0) return;

		const newIndex = activeImageIndex === productImages.length - 1 ? 0 : activeImageIndex + 1;
		setActiveImage(productImages[newIndex]);
	};

	const availableSizes = useMemo(() => {
		if (!product) {
			return [];
		}

		if (Array.isArray(product.sizes) && product.sizes.length > 0) {
			return product.sizes;
		}

		if (product.size) {
			return [product.size];
		}

		return [];
	}, [product]);

	useEffect(() => {
		if (availableSizes.length > 0) {
			setSelectedSize(String(availableSizes[0]));
		} else {
			setSelectedSize('');
		}
	}, [availableSizes]);

	const handleAddToCart = () => {
		if (!product) {
			return;
		}

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
			image: product.image,
		});

		navigate('/cart');
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
		<section className="page page--product-detail">
			<div className="container product-detail-container">
				<Link to="/products" className="back-link">← Back to Products</Link>

				<div className="product-detail-grid">
					<div className="product-image-section">
						<div className="product-gallery-wrapper">
							<div className="product-image-frame">
								<img
									src={imageUrl}
									alt={product.name}
									className="product-image"
									onError={(event) => {
										event.currentTarget.src = '/images/carousel/image3.jpg';
									}}
								/>

								{productImages.length > 1 && (
									<>
										<button
											type="button"
											className="gallery-nav-btn gallery-nav-btn--prev"
											onClick={goToPreviousImage}
											aria-label="Previous image"
										>
											‹
										</button>
										<button
											type="button"
											className="gallery-nav-btn gallery-nav-btn--next"
											onClick={goToNextImage}
											aria-label="Next image"
										>
											›
										</button>
									</>
								)}
							</div>

							{productImages.length > 1 && (
								<div className="product-thumbnails">
									{productImages.map((imagePath, index) => (
										<button
											type="button"
											key={`${imagePath}-${index}`}
											className={`product-thumbnail-btn ${displayImage === imagePath ? 'active' : ''}`}
											onClick={() => setActiveImage(imagePath)}
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
							)}
						</div>
					</div>

					<div className="product-info-section">
						<p className="page-kicker">School Shoes</p>
						<h1>{product.name}</h1>

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

						<button
							type="button"
							className="btn btn--primary"
							onClick={handleAddToCart}
							disabled={product.stock === 0}
						>
							Add to Cart
						</button>

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
