import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit, FiPackage, FiDollarSign, FiImage, FiX } from 'react-icons/fi';
import api from '../../utils/api.js';
import { getProductImageUrl } from '../../utils/format.js';

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

function parseSizes(value) {
    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function normalizeImageList(product) {
    const fromRelation = Array.isArray(product.product_images)
        ? product.product_images.map((item) => ({
            id: item.id,
            image_path: item.image_path,
        }))
        : [];

    if (fromRelation.length > 0) {
        return fromRelation;
    }

    if (product.image) {
        return [{ id: null, image_path: product.image }];
    }

    return [];
}

export default function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingProductId, setEditingProductId] = useState(null);
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const [editSuccessMessage, setEditSuccessMessage] = useState('');
    const [editForm, setEditForm] = useState({
        name: '',
        category: categoryOptions[0],
        audience: audienceOptions[2].value,
        description: '',
        price: '',
        sizesText: '',
        stock: '',
        image: null,
        extraImages: [],
        existingImages: [],
        removedImageIds: [],
    });

    const fetchProducts = async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = () => {
        navigate('/admin/products/create');
    };

    const handleEditClick = (productId) => {
        const product = products.find((item) => item.id === productId);
        if (!product) {
            return;
        }

        setEditSuccessMessage('');
        setErrorMessage('');
        setEditingProductId(product.id);
        setEditForm({
            name: product.name || '',
            category: categoryOptions.includes(product.category) ? product.category : categoryOptions[0],
            audience: audienceOptions.some((item) => item.value === product.audience) ? product.audience : audienceOptions[2].value,
            description: product.description || '',
            price: String(product.price || ''),
            sizesText: parseSizes(product.size).join(', '),
            stock: String(product.stock || ''),
            image: null,
            extraImages: [],
            existingImages: normalizeImageList(product),
            removedImageIds: [],
        });
    };

    const handleCancelEdit = () => {
        setEditingProductId(null);
        setSubmittingEdit(false);
    };

    const handleEditInputChange = (event) => {
        const { name, value } = event.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditImageChange = (event) => {
        const file = event.target.files?.[0] || null;
        setEditForm((prev) => ({
            ...prev,
            image: file,
        }));
    };

    const handleEditExtraImagesChange = (event) => {
        const files = Array.from(event.target.files || []);

        setEditForm((prev) => ({
            ...prev,
            extraImages: files,
        }));
    };

    const toggleRemoveExistingImage = (imageId) => {
        if (!imageId) {
            return;
        }

        setEditForm((prev) => {
            const exists = prev.removedImageIds.includes(imageId);

            return {
                ...prev,
                removedImageIds: exists
                    ? prev.removedImageIds.filter((id) => id !== imageId)
                    : [...prev.removedImageIds, imageId],
            };
        });
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();

        if (!editingProductId) {
            return;
        }

        const sizes = parseSizes(editForm.sizesText);
        if (sizes.length === 0) {
            setErrorMessage('Please provide at least one size before saving.');
            return;
        }

        setSubmittingEdit(true);
        setErrorMessage('');
        setEditSuccessMessage('');

        try {
            const payload = new FormData();
            payload.append('name', editForm.name.trim());
            payload.append('category', editForm.category);
            payload.append('audience', editForm.audience);
            payload.append('price', editForm.price);
            payload.append('size', sizes.join(', '));
            sizes.forEach((item) => {
                payload.append('sizes[]', item);
            });
            payload.append('stock', editForm.stock);
            payload.append('description', editForm.description);

            if (editForm.image) {
                payload.append('image', editForm.image);
            }

            editForm.extraImages.forEach((item) => {
                payload.append('images[]', item);
            });

            editForm.removedImageIds.forEach((id) => {
                payload.append('removed_image_ids[]', String(id));
            });

            payload.append('_method', 'PUT');

            await api.post(`/products/${editingProductId}`, payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setEditSuccessMessage('Product updated successfully.');
            setEditingProductId(null);
            await fetchProducts();
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to update product.');
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDelete = async (productId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${productId}`);
                fetchProducts();
            } catch (error) {
                alert(error?.response?.data?.message || 'Failed to delete product.');
            }
        }
    };

    const filteredProducts = products.filter((product) => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) {
            return true;
        }

        return (
            product.name.toLowerCase().includes(keyword) ||
            String(product.size).toLowerCase().includes(keyword)
        );
    });

    return (
        <section className="page page--admin-products">
            <div className="admin-page-header">
                <div>
                    <h1>Products</h1>
                    <p>Manage your school shoe inventory</p>
                </div>
                <button className="btn-small btn-small--primary" onClick={handleAddProduct} title="Create a new product">
                    <FiPlus /> Add Product
                </button>
            </div>

            <div className="products-toolbar">
                <div className="search-input">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="products-search"
                        placeholder="Search by product name or size"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>
            </div>

            {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
            {editSuccessMessage && <div className="alert alert-success">{editSuccessMessage}</div>}

            {editingProductId && (
                <form className="edit-product-form-container" onSubmit={handleEditSubmit}>
                    {/* Edit Form Header */}
                    <div className="edit-form-header-section">
                        <div className="header-content">
                            <div className="header-icon-wrapper">
                                <FiEdit className="form-icon" />
                            </div>
                            <div>
                                <h2 className="edit-form-title">Edit Product</h2>
                                <p className="edit-form-subtitle">Update product details, pricing, sizes, and images</p>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            className="btn-close-edit" 
                            onClick={handleCancelEdit}
                            title="Close edit form"
                        >
                            <FiX />
                        </button>
                    </div>

                    {/* Product Information Section */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <div className="header-icon-wrapper">
                                <FiPackage className="form-icon" />
                            </div>
                            <div>
                                <h3 className="form-card-title">Product Information</h3>
                                <p className="form-card-subtitle">Basic product details</p>
                            </div>
                        </div>

                        <div className="form-card-body">
                            <div className="form-group">
                                <label htmlFor="edit-name" className="form-label">Product Name <span className="required">*</span></label>
                                <input
                                    id="edit-name"
                                    name="name"
                                    type="text"
                                    value={editForm.name}
                                    onChange={handleEditInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="edit-category" className="form-label">Category <span className="required">*</span></label>
                                    <select
                                        id="edit-category"
                                        name="category"
                                        value={editForm.category}
                                        onChange={handleEditInputChange}
                                        className="form-select"
                                        required
                                    >
                                        {categoryOptions.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-audience" className="form-label">Target Audience <span className="required">*</span></label>
                                    <select
                                        id="edit-audience"
                                        name="audience"
                                        value={editForm.audience}
                                        onChange={handleEditInputChange}
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
                                <label htmlFor="edit-description" className="form-label">Description</label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleEditInputChange}
                                    className="form-textarea"
                                    rows="5"
                                    placeholder="Describe the product features, quality, and benefits..."
                                />
                                <p className="form-helper">Optional: Add detailed information about the product</p>
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
                                <h3 className="form-card-title">Pricing & Inventory</h3>
                                <p className="form-card-subtitle">Price, sizes, and stock quantity</p>
                            </div>
                        </div>

                        <div className="form-card-body">
                            <div className="form-row form-row-three">
                                <div className="form-group">
                                    <label htmlFor="edit-price" className="form-label">Price <span className="required">*</span></label>
                                    <div className="input-prefix">
                                        <span className="currency-symbol">₱</span>
                                        <input
                                            id="edit-price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editForm.price}
                                            onChange={handleEditInputChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <p className="form-helper">Price in Philippine Peso</p>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-sizes" className="form-label">Available Sizes <span className="required">*</span></label>
                                    <input
                                        id="edit-sizes"
                                        name="sizesText"
                                        type="text"
                                        value={editForm.sizesText}
                                        onChange={handleEditInputChange}
                                        placeholder="36, 37, 38, 39"
                                        className="form-input"
                                        required
                                    />
                                    <p className="form-helper">Comma-separated: 36, 37, 38</p>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-stock" className="form-label">Stock Quantity <span className="required">*</span></label>
                                    <input
                                        id="edit-stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        value={editForm.stock}
                                        onChange={handleEditInputChange}
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
                                <h3 className="form-card-title">Product Images</h3>
                                <p className="form-card-subtitle">Update main and additional images</p>
                            </div>
                        </div>

                        <div className="form-card-body">
                            {/* Replace Main Image */}
                            <div className="form-group">
                                <label htmlFor="edit-image" className="form-label">Replace Main Image</label>
                                <div className="file-upload-wrapper">
                                    <input
                                        id="edit-image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditImageChange}
                                        className="file-input-hidden"
                                    />
                                    <label htmlFor="edit-image" className="file-upload-label">
                                        <div className="upload-icon">📤</div>
                                        <p className="upload-text">Click to upload new main image</p>
                                        <p className="upload-subtext">PNG, JPG, GIF up to 5MB</p>
                                    </label>
                                    {editForm.image && (
                                        <div className="file-selected-info">
                                            <span className="check-icon">✓</span>
                                            <span className="file-name">{editForm.image.name}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="form-helper">Leave empty to keep current main image</p>
                            </div>

                            {/* Add More Images */}
                            <div className="form-group">
                                <label htmlFor="edit-images" className="form-label">Add More Images</label>
                                <div className="file-upload-wrapper">
                                    <input
                                        id="edit-images"
                                        name="images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleEditExtraImagesChange}
                                        className="file-input-hidden"
                                    />
                                    <label htmlFor="edit-images" className="file-upload-label">
                                        <div className="upload-icon">📸</div>
                                        <p className="upload-text">Click to upload or drag images</p>
                                        <p className="upload-subtext">PNG, JPG, GIF up to 5MB each</p>
                                    </label>
                                    {editForm.extraImages.length > 0 && (
                                        <div className="selected-images-list">
                                            <p className="selected-count">{editForm.extraImages.length} image(s) to add:</p>
                                            <ul className="images-list">
                                                {editForm.extraImages.map((file) => (
                                                    <li key={file.name} className="image-list-item">
                                                        <span className="check-icon-small">✓</span>
                                                        <span>{file.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <p className="form-helper">Optional: Add more product photos to the gallery</p>
                            </div>

                            {/* Existing Images */}
                            <div className="form-group">
                                <label className="form-label">Current Product Images</label>
                                {editForm.existingImages.length === 0 ? (
                                    <div className="empty-images-state">
                                        <p>No saved images yet. Upload some to get started.</p>
                                    </div>
                                ) : (
                                    <div className="existing-images-grid">
                                        {editForm.existingImages.map((image, index) => {
                                            const isMarkedForRemoval = image.id
                                                ? editForm.removedImageIds.includes(image.id)
                                                : false;

                                            return (
                                                <div
                                                    key={`${image.image_path}-${index}`}
                                                    className={`existing-image-card ${isMarkedForRemoval ? 'is-removing' : ''}`}
                                                >
                                                    <img
                                                        src={getProductImageUrl(image.image_path)}
                                                        alt={`Product ${index + 1}`}
                                                        className="product-thumbnail"
                                                    />
                                                    {index === 0 && (
                                                        <span className="image-badge-main">Main</span>
                                                    )}
                                                    {image.id ? (
                                                        <button
                                                            type="button"
                                                            className={`btn-image-action ${isMarkedForRemoval ? 'btn-undo' : 'btn-remove'}`}
                                                            onClick={() => toggleRemoveExistingImage(image.id)}
                                                            title={isMarkedForRemoval ? 'Undo removal' : 'Remove image'}
                                                        >
                                                            {isMarkedForRemoval ? 'Undo' : 'Remove'}
                                                        </button>
                                                    ) : (
                                                        <span className="image-legacy-badge">Legacy</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <p className="form-helper">Click "Remove" to delete images from this product</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="edit-form-actions">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleCancelEdit}
                            disabled={submittingEdit}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={submittingEdit}
                        >
                            {submittingEdit ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="loading">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <p>No products yet.</p>
                    <button className="btn-small btn-small--primary" onClick={handleAddProduct}>
                        Create your first product
                    </button>
                </div>
            ) : (
                <div className="products-table-wrapper">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>For</th>
                                <th>Price</th>
                                <th>Size</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className="product-image-cell">
                                        <img 
                                            src={getProductImageUrl(product.image)} 
                                            alt={product.name}
                                            className="product-thumbnail"
                                        />
                                    </td>
                                    <td className="product-name-cell">
                                        <strong>{product.name}</strong>
                                    </td>
                                    <td>{String(product.category || '-')}</td>
                                    <td>{String(product.audience || '-').toUpperCase()}</td>
                                    <td className="price-cell">₱{Number(product.price).toFixed(2)}</td>
                                    <td className="sizes-cell">{parseSizes(product.size).join(', ') || '-'}</td>
                                    <td className="stock-cell">
                                        <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : 'low-stock'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="btn-action"
                                            onClick={() => handleEditClick(product.id)}
                                            title="Edit this product"
                                        >
                                            ✎ Edit
                                        </button>
                                        <button 
                                            className="btn-action btn-action--danger"
                                            onClick={() => handleDelete(product.id)}
                                            title="Delete this product"
                                        >
                                            🗑 Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
