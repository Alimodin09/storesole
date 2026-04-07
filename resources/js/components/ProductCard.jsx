import React from 'react';
import { Link } from 'react-router-dom';
import { formatPeso, getProductImageUrl } from '../utils/format.js';

export default function ProductCard({ product, showAddToCart = false, onAddToCart = null }) {
	const inStock = product.stock !== undefined ? product.stock > 0 : true;
	const stockText = product.stock !== undefined ? `${product.stock} in stock` : '123 in stock';
	const sizeText = product.size ? `Size: ${product.size}` : product.sizes?.length ? `Sizes: ${product.sizes.join(', ')}` : null;
	const imageUrl = getProductImageUrl(product.image);

	const handleAddToCart = () => {
		if (!onAddToCart || !inStock) {
			return;
		}

		onAddToCart(product);
	};

	return (
		<article className="product-card">
			<div className="product-card__image">
				{product.image ? (
					<img src={imageUrl} alt={product.name} onError={(event) => { event.currentTarget.src = '/images/carousel/image3.jpg'; }} />
				) : (
					<div className="product-card__placeholder">{product.name.slice(0, 1)}</div>
				)}
			</div>
			<h3 className="product-card__title">{product.name}</h3>
			{product.description && <p className="product-card__description">{product.description}</p>}
			{sizeText && <p className="product-card__sizes">{sizeText}</p>}
			<div className="product-card__footer">
				<p className="product-card__price">{formatPeso(product.price)}</p>
				<p className={`product-card__stock ${inStock ? 'in-stock' : 'out-of-stock'}`}>
					{inStock ? stockText : 'Out of stock'}
				</p>
			</div>
			{showAddToCart && (
				<button
					type="button"
					className="product-card__quick-add"
					onClick={handleAddToCart}
					disabled={!inStock}
				>
					{inStock ? 'Add to Cart' : 'Out of Stock'}
				</button>
			)}
			<Link to={`/products/${product.id}`} className="product-card__cta">
				View Details
			</Link>
		</article>
	);
}
