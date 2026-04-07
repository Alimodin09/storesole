import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';

const categoryOptions = [
	'Formal School Shoes',
	'PE / Rubber Shoes',
	'Black Leather Shoes',
	'White School Shoes',
];

export default function ProductCreate() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [formData, setFormData] = useState({
		name: '',
		category: categoryOptions[0],
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

		if (!formData.name.trim() || !formData.price || !formData.stock || !formData.size.trim() || !formData.category) {
			setErrorMessage('Please fill in name, category, price, size, and stock.');
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
			<div className="form-header">
				<div>
					<h1>Create New Product</h1>
					<p>Add a new school shoe product to your inventory</p>
				</div>
			</div>

			{errorMessage && <div className="alert alert-error">{errorMessage}</div>}

			{successMessage && (
				<div className="alert alert-success">
					{successMessage}
				</div>
			)}

			<form onSubmit={handleSubmit} className="product-form">
				<div className="form-section">
					<h3>Product Information</h3>

					<div className="form-group">
						<label htmlFor="name">Product Name *</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							placeholder="e.g., Classic School Sneaker Black"
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="category">Category *</label>
						<select
							id="category"
							name="category"
							value={formData.category}
							onChange={handleInputChange}
							required
						>
							{categoryOptions.map((item) => (
								<option key={item} value={item}>{item}</option>
							))}
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="description">Description</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleInputChange}
							placeholder="Describe the product features and benefits"
							rows="4"
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="price">Price (₱) *</label>
							<input
								type="number"
								id="price"
								name="price"
								value={formData.price}
								onChange={handleInputChange}
								placeholder="0.00"
								step="0.01"
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="size">Size *</label>
							<input
								type="text"
								id="size"
								name="size"
								value={formData.size}
								onChange={handleInputChange}
								placeholder="e.g., 36, 37, 38"
								required
							/>
							<p className="section-hint">Use comma-separated sizes for multiple options.</p>
						</div>

						<div className="form-group">
							<label htmlFor="stock">Stock Quantity *</label>
							<input
								type="number"
								id="stock"
								name="stock"
								value={formData.stock}
								onChange={handleInputChange}
								placeholder="0"
								required
							/>
						</div>
					</div>
				</div>

				<div className="form-section">
					<h3>Product Images</h3>
					<div className="form-group">
						<label htmlFor="image">Main Image</label>
						<input
							type="file"
							id="image"
							name="image"
							onChange={handleImageChange}
							accept="image/*"
						/>
						{formData.image && (
							<p className="form-file-info">Main: {formData.image.name}</p>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="images">Extra Images</label>
						<input
							type="file"
							id="images"
							name="images"
							onChange={handleExtraImagesChange}
							accept="image/*"
							multiple
						/>
						<p className="section-hint">Upload additional product images. If no main image is set, the first image will be used as main.</p>
						{formData.extraImages.length > 0 && (
							<ul className="selected-files-list">
								{formData.extraImages.map((file) => (
									<li key={file.name}>{file.name}</li>
								))}
							</ul>
						)}
					</div>
				</div>

				<div className="form-actions">
					<button
						type="button"
						className="btn btn-secondary"
						onClick={handleCancel}
						disabled={loading}
					>
						Cancel
					</button>
					<button
						type="submit"
						className="btn btn-primary"
						disabled={loading}
					>
						{loading ? 'Creating...' : 'Create Product'}
					</button>
				</div>
			</form>
		</section>
	);
}
