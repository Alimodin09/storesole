import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiDollarSign, FiImage, FiArrowLeft } from 'react-icons/fi';
import api from '../../utils/api.js';

const categoryOptions = [
	'Formal School Shoes',
	'PE / Rubber Shoes',
	'Black Leather Shoes',
	'White School Shoes',
];

const audienceOptions = [
	{ value: 'men', label: 'Men' },
	{ value: 'women', label: 'Women' },
	{ value: 'kids', label: 'Kids' },
];

export default function ProductCreate() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [formData, setFormData] = useState({
		name: '',
		category: categoryOptions[0],
		audience: audienceOptions[2].value,
		description: '',
		price: '',
		size: '',
		image: null,
		extraImages: [],
		stock: '',
	});
	const [errorMessage, setErrorMessage] = useState('');

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData(prev => ({
				...prev,
				image: file
			}));
		}
	};

	const handleExtraImagesChange = (e) => {
		const files = Array.from(e.target.files || []);

		setFormData((prev) => ({
			...prev,
			extraImages: files,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setErrorMessage('');

		if (!formData.name.trim() || !formData.price || !formData.stock || !formData.size.trim() || !formData.category || !formData.audience) {
			setErrorMessage('Please fill in name, category, audience, price, size, and stock.');
			setLoading(false);
			return;
		}

		try {
			const normalizedSizes = formData.size
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean);

			if (normalizedSizes.length === 0) {
				setErrorMessage('Please provide at least one size. Example: 36, 37, 38');
				setLoading(false);
				return;
			}

			const payload = new FormData();
			payload.append('name', formData.name);
			payload.append('category', formData.category);
			payload.append('audience', formData.audience);
			payload.append('price', formData.price);
			payload.append('size', normalizedSizes.join(', '));
			normalizedSizes.forEach((item) => {
				payload.append('sizes[]', item);
			});
			payload.append('stock', formData.stock);
			payload.append('description', formData.description);

			if (formData.image) {
				payload.append('image', formData.image);
			}

			formData.extraImages.forEach((file) => {
				payload.append('images[]', file);
			});

			await api.post('/products', payload, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			setSuccessMessage('Product created successfully!');
			setLoading(false);

			setTimeout(() => {
				navigate('/admin/products');
			}, 1500);
		} catch (error) {
			setErrorMessage(error?.response?.data?.message || 'Error creating product. Please try again.');
			setLoading(false);
		}
	};

	const handleCancel = () => {
		navigate('/admin/products');
	};

	return (
		<section className="page page--admin-product-create">
			{/* Page Header */}
			<div className="product-create-header">
				<div className="header-content">
					<h1 className="header-title">Create New Product</h1>
					<p className="header-subtitle">Add a new school shoe product to your inventory. Fill in all required fields to complete the product entry.</p>
				</div>
				<button 
					type="button"
					className="btn-header-back"
					onClick={handleCancel}
					title="Go back to products list"
				>
					<FiArrowLeft />
				</button>
			</div>

			{/* Alert Messages */}
			{errorMessage && <div className="alert alert-error">{errorMessage}</div>}
			{successMessage && <div className="alert alert-success">{successMessage}</div>}

			{/* Main Form */}
			<form onSubmit={handleSubmit} className="product-form-container">
				{/* Product Information Section */}
				<div className="form-card">
					<div className="form-card-header">
						<div className="header-icon-wrapper">
							<FiPackage className="form-icon" />
						</div>
						<div>
							<h2 className="form-card-title">Product Information</h2>
							<p className="form-card-subtitle">Basic details about your shoe product</p>
						</div>
					</div>

					<div className="form-card-body">
						<div className="form-group">
							<label htmlFor="name" className="form-label">Product Name <span className="required">*</span></label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								placeholder="e.g., Classic School Sneaker Black"
								className="form-input"
								required
							/>
							<p className="form-helper">Enter a clear, descriptive product name</p>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="category" className="form-label">Category <span className="required">*</span></label>
								<select
									id="category"
									name="category"
									value={formData.category}
									onChange={handleInputChange}
									className="form-select"
									required
								>
									{categoryOptions.map((item) => (
										<option key={item} value={item}>{item}</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="audience" className="form-label">Target Audience <span className="required">*</span></label>
								<select
									id="audience"
									name="audience"
									value={formData.audience}
									onChange={handleInputChange}
									className="form-select"
									required
								>
									{audienceOptions.map((item) => (
										<option key={item.value} value={item.value}>{item.label}</option>
									))}
								</select>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="description" className="form-label">Description</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								placeholder="Describe the product features, quality, benefits, and materials..."
								className="form-textarea"
								rows="5"
							/>
							<p className="form-helper">Optional: Add detailed information about the product to help customers</p>
						</div>
					</div>
				</div>

				{/* Pricing & Inventory Section */}
				<div className="form-card">
					<div className="form-card-header">
						<div className="header-icon-wrapper">
							<FiDollarSign className="form-icon" />
						</div>
						<div>
							<h2 className="form-card-title">Pricing & Inventory</h2>
							<p className="form-card-subtitle">Set price, sizes, and stock quantity</p>
						</div>
					</div>

					<div className="form-card-body">
						<div className="form-row form-row-three">
							<div className="form-group">
								<label htmlFor="price" className="form-label">Price <span className="required">*</span></label>
								<div className="input-prefix">
									<span className="currency-symbol">₱</span>
									<input
										type="number"
										id="price"
										name="price"
										value={formData.price}
										onChange={handleInputChange}
										placeholder="0.00"
										step="0.01"
										min="0"
										className="form-input"
										required
									/>
								</div>
								<p className="form-helper">Price in Philippine Peso</p>
							</div>

							<div className="form-group">
								<label htmlFor="size" className="form-label">Available Sizes <span className="required">*</span></label>
								<input
									type="text"
									id="size"
									name="size"
									value={formData.size}
									onChange={handleInputChange}
									placeholder="36, 37, 38, 39"
									className="form-input"
									required
								/>
								<p className="form-helper">Comma-separated: 36, 37, 38</p>
							</div>

							<div className="form-group">
								<label htmlFor="stock" className="form-label">Stock Quantity <span className="required">*</span></label>
								<input
									type="number"
									id="stock"
									name="stock"
									value={formData.stock}
									onChange={handleInputChange}
									placeholder="0"
									min="0"
									className="form-input"
									required
								/>
								<p className="form-helper">Total units available</p>
							</div>
						</div>
					</div>
				</div>

				{/* Product Images Section */}
				<div className="form-card">
					<div className="form-card-header">
						<div className="header-icon-wrapper">
							<FiImage className="form-icon" />
						</div>
						<div>
							<h2 className="form-card-title">Product Images</h2>
							<p className="form-card-subtitle">Upload high-quality product photos</p>
						</div>
					</div>

					<div className="form-card-body">
						{/* Main Image */}
						<div className="form-group">
							<label htmlFor="image" className="form-label">Main Product Image</label>
							<div className="file-upload-wrapper">
								<input
									type="file"
									id="image"
									name="image"
									onChange={handleImageChange}
									accept="image/*"
									className="file-input-hidden"
								/>
								<label htmlFor="image" className="file-upload-label">
									<div className="upload-icon">📤</div>
									<p className="upload-text">Click to upload or drag image here</p>
									<p className="upload-subtext">PNG, JPG, GIF up to 5MB</p>
								</label>
								{formData.image && (
									<div className="file-selected-info">
										<span className="check-icon">✓</span>
										<span className="file-name">{formData.image.name}</span>
									</div>
								)}
							</div>
							<p className="form-helper">This will be the primary product image displayed in listings</p>
						</div>

						{/* Additional Images */}
						<div className="form-group">
							<label htmlFor="images" className="form-label">Additional Images</label>
							<div className="file-upload-wrapper">
								<input
									type="file"
									id="images"
									name="images"
									onChange={handleExtraImagesChange}
									accept="image/*"
									multiple
									className="file-input-hidden"
								/>
								<label htmlFor="images" className="file-upload-label">
									<div className="upload-icon">📸</div>
									<p className="upload-text">Click to upload or drag images here</p>
									<p className="upload-subtext">PNG, JPG, GIF up to 5MB each</p>
								</label>
								{formData.extraImages.length > 0 && (
									<div className="selected-images-list">
										<p className="selected-count">{formData.extraImages.length} image(s) selected:</p>
										<ul className="images-list">
											{formData.extraImages.map((file) => (
												<li key={file.name} className="image-list-item">
													<span className="check-icon-small">✓</span>
													<span>{file.name}</span>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
							<p className="form-helper">Upload multiple images to showcase different angles and details of the product</p>
						</div>
					</div>
				</div>

				{/* Form Actions */}
				<div className="form-actions-container">
					<button
						type="button"
						className="btn btn-outline"
						onClick={handleCancel}
						disabled={loading}
					>
						<FiArrowLeft />
						Cancel
					</button>
					<button
						type="submit"
						className="btn btn-primary btn-lg"
						disabled={loading}
					>
						{loading ? 'Creating Product...' : 'Create Product'}
					</button>
				</div>
			</form>
		</section>
	);
}
