import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPeso, getProductImageUrl } from '../utils/format.js';

export default function ProductCard({ product, showAddToCart = false, onAddToCart = null }) {
	const navigate = useNavigate();
	const inStock = product.stock !== undefined ? product.stock > 0 : true;
	const lowStock = inStock && product.stock !== undefined ? Number(product.stock) <= 5 : false;
	const stockText = product.stock !== undefined ? `${product.stock} in stock` : 'In stock';
	const imageUrl = getProductImageUrl(product.image);
	const description = product.description || 'Comfortable and durable design for everyday school use.';
	const displayStockText = inStock ? (lowStock ? `Low stock: ${stockText}` : stockText) : 'Out of stock';

	const handleAddToCart = (event) => {
		event.stopPropagation();
		if (!onAddToCart || !inStock) {
			return;
		}

		onAddToCart(product);
	};

	const handleCardClick = () => {
		navigate(`/products/${product.id}`);
	};

	return (
		<article
			className="product-card storefront-card"
			role="button"
			tabIndex={0}
			onClick={handleCardClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleCardClick();
				}
			}}
		>
			<div className="storefront-card__media">
				{product.image ? (
					<img
						src={imageUrl}
						alt={product.name}
						className="storefront-card__image"
						onError={(event) => {
							event.currentTarget.src = '/images/carousel/image3.jpg';
						}}
					/>
				) : (
					<div className="storefront-card__placeholder">{product.name.slice(0, 1)}</div>
				)}
			</div>

			<div className="storefront-card__body">
				<p className={`storefront-card__stock ${inStock ? 'in-stock' : 'out-of-stock'} ${lowStock ? 'is-low' : ''}`}>
					{displayStockText}
				</p>

				<h3 className="storefront-card__title">{product.name}</h3>
				<p className="storefront-card__description">{description}</p>

				<div className="storefront-card__footer">
					<div className="storefront-card__price-row">
						<p className="storefront-card__price">{formatPeso(product.price)}</p>
						{showAddToCart ? (
							<button
								type="button"
								className="storefront-card__add-to-cart-btn"
								onClick={handleAddToCart}
								disabled={!inStock}
								aria-label="Add to cart"
								title={inStock ? 'Add to cart' : 'Out of stock'}
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="9" cy="21" r="1" />
									<circle cx="20" cy="21" r="1" />
									<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
								</svg>
							</button>
						) : null}
					</div>
				</div>
			</div>
		</article>
	);
}
