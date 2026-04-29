import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import api from '../utils/api.js';
import { addCartItem } from '../utils/cart.js';
import { isAuthenticated } from '../utils/auth.js';
import { formatPeso, getProductImageUrl } from '../utils/format.js';

const categoryOptions = ['All', 'Formal School Shoes', 'PE / Rubber Shoes', 'Black Leather Shoes', 'White School Shoes'];
const audienceOptions = ['all', 'men', 'women', 'kids'];
const sortOptions = [
	{ value: 'name', label: 'Newest First', shortLabel: 'Newest' },
	{ value: 'price-low', label: 'Price: Low to High', shortLabel: 'Price: Low to High' },
	{ value: 'price-high', label: 'Price: High to Low', shortLabel: 'Price: High to Low' },
	{ value: 'popular', label: 'Most Popular', shortLabel: 'Most Popular' }
];

function normalizeCategory(value) {
	const normalized = String(value || 'all').trim().toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');

	if (audienceOptions.includes(normalized)) {
		return 'All';
	}

	const categoryMap = {
		all: 'All',
		'formal-school-shoes': 'Formal School Shoes',
		formal: 'Formal School Shoes',
		'pe-rubber-shoes': 'PE / Rubber Shoes',
		rubber: 'PE / Rubber Shoes',
		'black-leather-shoes': 'Black Leather Shoes',
		'white-school-shoes': 'White School Shoes'
	};

	return categoryMap[normalized] || 'All';
}

function normalizeAudience(value) {
	const normalized = String(value || 'all').trim().toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');

	if (['men', 'man', 'male', 'boys'].includes(normalized)) return 'men';
	if (['women', 'woman', 'female', 'ladies', 'girls'].includes(normalized)) return 'women';
	if (['kids', 'kid', 'children', 'child', 'youth', 'junior'].includes(normalized)) return 'kids';

	return 'all';
}

function resolveAudience(searchParams) {
	const explicitAudience = searchParams.get('audience') || searchParams.get('gender') || searchParams.get('target');
	if (explicitAudience) {
		return normalizeAudience(explicitAudience);
	}

	const categoryParam = searchParams.get('category');
	if (categoryParam) {
		return normalizeAudience(categoryParam);
	}

	return 'all';
}

function normalize(value) {
	return String(value || '').toLowerCase().trim();
}

function getProductType(product) {
	return normalize(product.product_type || product.category);
}

function getTargetGroup(product) {
	return normalize(product.target_group || product.audience);
}

function matchesCategory(product, category) {
	if (category === 'All') return true;
	
	// Support both product_type (new) and category (legacy/accessor)
	const productCategory = getProductType(product);
	const normalizedCategory = normalize(category);
	
	return productCategory === normalizedCategory;
}

function getProductSizes(product) {
	if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
		return product.sizes.map((size) => String(size).trim()).filter(Boolean);
	}

	if (typeof product?.size === 'string' && product.size.includes(',')) {
		return product.size
			.split(',')
			.map((size) => size.trim())
			.filter(Boolean);
	}

	if (product?.size !== undefined && product?.size !== null && String(product.size).trim()) {
		return [String(product.size).trim()];
	}

	return ['N/A'];
}

function getProductImageCandidates(product) {
	return [
		product?.image,
		...(Array.isArray(product?.image_paths) ? product.image_paths : []),
		...(Array.isArray(product?.product_images) ? product.product_images.map((item) => item?.image_path) : [])
	].map((imagePath) => String(imagePath || '').trim()).filter(Boolean);
}

function getFirstProductImage(product) {
	return getProductImageCandidates(product)[0] || '';
}

function matchesAudience(product, audience) {
	if (audience === 'all') return true;

	// Support both audience and target_group fields
	const value = normalizeAudience((product?.target_group || product?.audience) || 'kids');
	return value === audience;
}

export default function Products() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const sortMenuRef = useRef(null);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [category, setCategory] = useState(normalizeCategory(searchParams.get('category')));
	const [audience, setAudience] = useState(resolveAudience(searchParams));
	const [sortBy, setSortBy] = useState(searchParams.get('filter') === 'popular' ? 'popular' : 'name');
	const [selectedSizes, setSelectedSizes] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [showFilters, setShowFilters] = useState(true);
	const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
	const [sizePickerProduct, setSizePickerProduct] = useState(null);
	const [selectedPurchaseSize, setSelectedPurchaseSize] = useState('');
	const itemsPerPage = 8;
	const query = searchParams.get('search') || '';

	useEffect(() => {
		setCategory(normalizeCategory(searchParams.get('category')));
		setAudience(resolveAudience(searchParams));
		setSortBy(searchParams.get('filter') === 'popular' ? 'popular' : 'name');
		setCurrentPage(1);
	}, [searchParams]);

	useEffect(() => {
		const handleDocumentClick = (event) => {
			if (!sortMenuRef.current || sortMenuRef.current.contains(event.target)) {
				return;
			}

			setIsSortMenuOpen(false);
		};

		document.addEventListener('mousedown', handleDocumentClick);
		return () => document.removeEventListener('mousedown', handleDocumentClick);
	}, []);

	useEffect(() => {
		let active = true;

		const fetchProducts = async () => {
			setLoading(true);
			setErrorMessage('');

			try {
				const { data } = await api.get('/products');
				if (active) setProducts(data);
			} catch (error) {
				if (active) setErrorMessage(error?.response?.data?.message || 'Failed to load products.');
			} finally {
				if (active) setLoading(false);
			}
		};

		fetchProducts();
		return () => { active = false; };
	}, []);

	const availableSizes = useMemo(() => {
		const sizes = new Set();
		products.forEach((product) => {
			if (Array.isArray(product.sizes) && product.sizes.length > 0) {
				product.sizes.forEach((size) => sizes.add(String(size)));
			} else if (product.size !== undefined && product.size !== null) {
				sizes.add(String(product.size));
			}
		});
		return [...sizes].sort((left, right) => Number(left) - Number(right));
	}, [products]);

	const filteredProducts = useMemo(() => {
		let items = [...products];

		if (audience !== 'all') {
			items = items.filter((product) => matchesAudience(product, audience));
		}

		if (query.trim()) {
			const keyword = query.trim().toLowerCase();
			items = items.filter((product) => (
				product.name.toLowerCase().includes(keyword) ||
				String(product.size || '').toLowerCase().includes(keyword) ||
				String(product.description || '').toLowerCase().includes(keyword)
			));
		}

		if (category !== 'All') {
			items = items.filter((product) => matchesCategory(product, category));
		}

		if (selectedSizes.length > 0) {
			items = items.filter((product) => {
				const productSizes = Array.isArray(product.sizes) && product.sizes.length > 0
					? product.sizes.map(String)
					: [String(product.size || '')];

				return selectedSizes.some((size) => productSizes.includes(size));
			});
		}

		// Apply sorting - create a new array to avoid mutating the original
		const sortedItems = [...items];

		if (sortBy === 'price-low') {
			sortedItems.sort((left, right) => Number(left.price) - Number(right.price));
		} else if (sortBy === 'price-high') {
			sortedItems.sort((left, right) => Number(right.price) - Number(left.price));
		} else if (sortBy === 'popular') {
			// Sort by sold_count/orders_count if available, fallback to stock or id
			sortedItems.sort((left, right) => {
				const leftSold = Number(left.sold_count || left.orders_count || left.stock || 0);
				const rightSold = Number(right.sold_count || right.orders_count || right.stock || 0);
				return rightSold - leftSold;
			});
		} else if (sortBy === 'name') {
			// Newest: sort by created_at DESC, fallback to id DESC
			sortedItems.sort((left, right) => {
				const leftId = Number(left.id || 0);
				const rightId = Number(right.id || 0);
				return rightId - leftId;
			});
		}

		return sortedItems;
	}, [products, audience, query, category, selectedSizes, sortBy]);

	const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
	const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const handleQuickAdd = (product) => {
		if (!isAuthenticated()) {
			window.alert('Please log in first before adding to cart.');
			navigate('/login');
			return;
		}

		const sizes = getProductSizes(product);
		setSizePickerProduct(product);
		setSelectedPurchaseSize(sizes.length === 1 ? sizes[0] : '');
	};

	const closeSizePicker = () => {
		setSizePickerProduct(null);
		setSelectedPurchaseSize('');
	};

	const confirmAddToCart = () => {
		if (!sizePickerProduct || !selectedPurchaseSize) {
			return;
		}

		addCartItem({
			id: sizePickerProduct.id,
			name: sizePickerProduct.name,
			price: Number(sizePickerProduct.price),
			size: selectedPurchaseSize,
			quantity: 1,
			stock: Number(sizePickerProduct.stock || 0),
			image: sizePickerProduct.image
		});

		window.alert('Item added to cart.');
		closeSizePicker();
	};

	const toggleSize = (size) => {
		setSelectedSizes((previous) => previous.includes(size) ? previous.filter((item) => item !== size) : [...previous, size]);
		setCurrentPage(1);
	};

	const selectedSort = sortOptions.find((option) => option.value === sortBy) || sortOptions[0];

	const selectSortOption = (value) => {
		setSortBy(value);
		setCurrentPage(1);
		setIsSortMenuOpen(false);
	};

	const visiblePageNumbers = useMemo(() => {
		const pages = [];
		const start = Math.max(1, currentPage - 2);
		const end = Math.min(totalPages, currentPage + 2);
		for (let page = start; page <= end; page += 1) pages.push(page);
		return pages;
	}, [currentPage, totalPages]);

	return (
		<section className="page page--products storefront-products">
			<div className={`container storefront-products__layout ${showFilters ? '' : 'is-filters-hidden'}`}>
				<aside className={`storefront-products__sidebar ${showFilters ? '' : 'is-hidden'}`} aria-label="Product filters" aria-hidden={!showFilters}>
					<div className="storefront-products__filter-card">
						<div className="storefront-products__filter-header">
							<p className="storefront-products__eyebrow">Refine results</p>
							<h3>Filters</h3>
						</div>

						<div className="storefront-products__filter-group">
							<label>Category</label>
							<div className="storefront-products__radio-list">
								{categoryOptions.map((item) => (
									<label key={item} className="storefront-products__radio-item">
										<input
											type="radio"
											name="products-category"
											value={item}
											checked={category === item}
											onChange={(event) => setCategory(event.target.value)}
										/>
										<span>{item}</span>
									</label>
								))}
							</div>
						</div>

						{availableSizes.length > 0 ? (
							<div className="storefront-products__filter-group">
								<label>Size</label>
								<div className="storefront-products__size-list">
									{availableSizes.map((size) => (
										<button
											type="button"
											key={size}
											className={`storefront-products__size-pill ${selectedSizes.includes(size) ? 'is-active' : ''}`}
											onClick={() => toggleSize(size)}
										>
											{size}
										</button>
									))}
								</div>
							</div>
						) : null}
					</div>
				</aside>

				<div className={`storefront-products__content ${showFilters ? '' : 'is-expanded'}`}>
					<div className="storefront-products__content-topbar">
						<div className="storefront-products__tools-row">
							<button
								type="button"
								className="storefront-products__filters-toggle"
								onClick={() => setShowFilters((previous) => !previous)}
							>
								{showFilters ? 'Hide Filters' : 'Show Filters'}
							</button>

							<div className={`storefront-products__sort-control ${isSortMenuOpen ? 'is-open' : ''}`} ref={sortMenuRef}>
								<button
									type="button"
									className="storefront-products__sort-trigger"
									onClick={() => setIsSortMenuOpen((previous) => !previous)}
									aria-expanded={isSortMenuOpen}
								>
									<span className="storefront-products__sort-label">Sort By:</span>
									<span className="storefront-products__sort-value">{selectedSort.shortLabel}</span>
									<svg className="storefront-products__sort-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
										<path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</button>

								{isSortMenuOpen ? (
									<div className="storefront-products__sort-menu" role="listbox" aria-label="Sort products">
										{sortOptions.map((option) => (
											<button
												type="button"
												key={option.value}
												className={`storefront-products__sort-option ${sortBy === option.value ? 'is-active' : ''}`}
												onClick={() => selectSortOption(option.value)}
												role="option"
												aria-selected={sortBy === option.value}
											>
												{option.label}
											</button>
										))}
									</div>
								) : null}
							</div>
						</div>
					</div>

					{errorMessage && <div className="alert alert-error">{errorMessage}</div>}

					{loading ? (
						<div className="products-empty">
							<h3>Loading products...</h3>
							<p>Please wait while we fetch the latest inventory.</p>
						</div>
					) : filteredProducts.length === 0 ? (
						<div className="products-empty">
							<h3>No products found</h3>
							<p>Try a different search, category, or sorting option.</p>
						</div>
					) : (
						<>
							<div className="products-grid storefront-products__grid">
								{paginatedProducts.map((product) => (
									<ProductCard
										key={product.id}
										product={product}
										showAddToCart
										onAddToCart={handleQuickAdd}
									/>
								))}
							</div>

							<div className="storefront-products__pagination" aria-label="Products pagination">
								<button
									type="button"
									className="storefront-products__page-btn"
									onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
									disabled={currentPage === 1}
								>
									‹
								</button>

								{visiblePageNumbers.map((page) => (
									<button
										type="button"
										key={page}
										className={`storefront-products__page-btn ${currentPage === page ? 'is-active' : ''}`}
										onClick={() => setCurrentPage(page)}
									>
										{page}
									</button>
								))}

								<button
									type="button"
									className="storefront-products__page-btn"
									onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
									disabled={currentPage === totalPages}
								>
									›
								</button>
							</div>
						</>
					)}
				</div>
			</div>

			{sizePickerProduct ? (
				<div className="storefront-products__modal-backdrop" onClick={closeSizePicker} role="presentation">
					<div
						className="storefront-products__modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="size-picker-title"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="storefront-products__modal-header">
							<div>
								<p className="storefront-products__modal-eyebrow">Choose size</p>
								<h3 id="size-picker-title">{sizePickerProduct.name}</h3>
							</div>
							<button type="button" className="storefront-products__modal-close" onClick={closeSizePicker} aria-label="Close size picker">
								×
							</button>
						</div>

						<div className="storefront-products__modal-product">
							<div className="storefront-products__modal-image-wrap">
								<img
									src={getProductImageUrl(getFirstProductImage(sizePickerProduct) || '/images/carousel/image3.jpg')}
									alt={sizePickerProduct.name}
									onError={(event) => {
										event.currentTarget.src = '/images/carousel/image3.jpg';
									}}
								/>
							</div>
							<div className="storefront-products__modal-product-meta">
								<span className="storefront-products__modal-category">{sizePickerProduct.category || 'School Shoes'}</span>
								<p className="storefront-products__modal-price">{formatPeso(sizePickerProduct.price)}</p>
								<p className="storefront-products__modal-note">Pick a size to continue to cart.</p>
							</div>
						</div>

						<div className="storefront-products__size-picker">
							{getProductSizes(sizePickerProduct).map((size) => (
								<button
									type="button"
									key={size}
									className={`storefront-products__size-option ${selectedPurchaseSize === size ? 'is-active' : ''}`}
									onClick={() => setSelectedPurchaseSize(size)}
								>
									{size}
								</button>
							))}
						</div>

						<div className="storefront-products__modal-actions">
							<button type="button" className="storefront-products__modal-secondary" onClick={closeSizePicker}>
								Cancel
							</button>
							<button
								type="button"
								className="storefront-products__modal-primary"
								onClick={confirmAddToCart}
								disabled={!selectedPurchaseSize}
							>
								Add to Cart
							</button>
						</div>
					</div>
				</div>
			) : null}
		</section>
	);
}