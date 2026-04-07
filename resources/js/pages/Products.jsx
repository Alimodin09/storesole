import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import api from '../utils/api.js';

const categoryOptions = ['All', 'Formal School Shoes', 'PE / Rubber Shoes', 'Black Leather Shoes', 'White School Shoes'];

function normalizeCategory(value) {
    const normalized = String(value || 'all')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/\//g, '-');

    const categoryMap = {
        all: 'All',
        'formal-school-shoes': 'Formal School Shoes',
        'pe-rubber-shoes': 'PE / Rubber Shoes',
        'black-leather-shoes': 'Black Leather Shoes',
        'white-school-shoes': 'White School Shoes'
    };

    return categoryMap[normalized] || 'All';
}

function matchesCategory(product, category) {
    if (category === 'All') {
        return true;
    }

    return String(product.category || '').toLowerCase() === category.toLowerCase();
}

export default function Products() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const query = searchParams.get('search') || '';
    const [category, setCategory] = useState(normalizeCategory(searchParams.get('category')));
    const [sortBy, setSortBy] = useState(searchParams.get('filter') === 'popular' ? 'popular' : 'name');
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setCategory(normalizeCategory(searchParams.get('category')));
        setSortBy(searchParams.get('filter') === 'popular' ? 'popular' : 'name');
    }, [searchParams]);

    useEffect(() => {
        let active = true;

        const fetchProducts = async () => {
            setLoading(true);
            setErrorMessage('');

            try {
                const { data } = await api.get('/products');
                if (active) {
                    setProducts(data);
                }
            } catch (error) {
                if (active) {
                    setErrorMessage(error?.response?.data?.message || 'Failed to load products.');
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

    const filteredProducts = useMemo(() => {
        let items = [...products];

        if (query.trim()) {
            const keyword = query.trim().toLowerCase();
            items = items.filter((product) => {
                return (
                    product.name.toLowerCase().includes(keyword) ||
                    String(product.size).toLowerCase().includes(keyword) ||
                    String(product.description || '').toLowerCase().includes(keyword)
                );
            });
        }

        if (category !== 'All') {
            items = items.filter((product) => matchesCategory(product, category));
        }

        if (sortBy === 'price-low') {
            items.sort((left, right) => Number(left.price) - Number(right.price));
        } else if (sortBy === 'price-high') {
            items.sort((left, right) => Number(right.price) - Number(left.price));
        } else if (sortBy === 'popular') {
            items.sort((left, right) => Number(right.stock) - Number(left.stock));
        } else {
            items.sort((left, right) => left.name.localeCompare(right.name));
        }

        return items;
    }, [products, query, category, sortBy]);

	const activeLabel = category === 'All' ? 'All Products' : `${category} Collection`;

    return (
        <section className="page page--products">
            <div className="container products-shell">
                <div className="products-header">
                    <div>
                        <h1>Shop School Shoes</h1>
                        <p>Find durable, comfortable, and stylish school shoes for every student.</p>
                    </div>
                    <div className="products-header__badge">{activeLabel}</div>
                </div>

                <div className="products-toolbar">
                    <div className="products-toolbar__controls">
                        <div className="products-control products-control--category">
                            <label className="products-control__label" htmlFor="products-category-filter">Filter By</label>
                            <select
                                id="products-category-filter"
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="products-select"
                            >
                                {categoryOptions.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <div className="products-control products-control--sort">
                            <label className="products-control__label" htmlFor="products-sort-filter">Sort By</label>
                            <select
                                id="products-sort-filter"
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                                className="products-select"
                            >
                                <option value="name">Name</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="popular">Popular</option>
                            </select>
                        </div>
                    </div>

                    <p className="product-count">Showing {filteredProducts.length} products</p>
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
                    <div className="products-grid">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
