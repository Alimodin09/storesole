import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api.js';
import { formatPeso, getProductImageUrl } from '../utils/format.js';

function paymentLabel(method) {
    if (method === 'cop') {
        return 'Cash on Pickup';
    }

    return 'Cash on Delivery';
}

export default function OrderDetails() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let active = true;

        const fetchOrder = async () => {
            setLoading(true);
            setErrorMessage('');

            try {
                const { data } = await api.get(`/user/orders/${id}`);

                if (active) {
                    setOrder(data);
                }
            } catch (error) {
                if (active) {
                    setErrorMessage(error?.response?.data?.message || 'Failed to load order details.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchOrder();

        return () => {
            active = false;
        };
    }, [id]);

    const computedTotal = useMemo(() => {
        if (!order?.order_items?.length) {
            return Number(order?.total || 0);
        }

        return order.order_items.reduce((sum, item) => {
            return sum + Number(item.unit_price) * Number(item.quantity);
        }, 0);
    }, [order]);

    const normalizedStatusClass = String(order?.status || 'default').toLowerCase().replace(/\s+/g, '-');

    if (loading) {
        return (
            <section className="page page--orders">
                <div className="container orders-shell">
                    <div className="no-orders">
                        <p>Loading order details...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (errorMessage || !order) {
        return (
            <section className="page page--orders">
                <div className="container orders-shell">
                    <div className="no-orders">
                        <p>{errorMessage || 'Order not found.'}</p>
                        <Link to="/orders" className="btn btn--primary">Back to My Orders</Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="page page--orders">
            <div className="container orders-shell">
                <div className="orders-details-header">
                    <Link to="/orders" className="orders-back-btn" aria-label="Back to orders">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </Link>
                    <h1>Order Details</h1>
                </div>

                <div className="order-details-layout">
                    <div className="order-details-main">
                        <section className="order-section order-info-section">
                            <div className="order-section-head">
                                <h2>Order Info</h2>
                            </div>

                            <div className="order-info-grid">
                                <div className="order-info-item">
                                    <p className="order-info-label">Order ID</p>
                                    <p className="order-info-value">#{order.id}</p>
                                </div>

                                <div className="order-info-item">
                                    <p className="order-info-label">Date</p>
                                    <p className="order-info-value">{new Date(order.created_at).toLocaleString()}</p>
                                </div>

                                <div className="order-info-item">
                                    <p className="order-info-label">Status</p>
                                    <p className="order-info-value">
                                        <span className={`status ${normalizedStatusClass}`}>
                                            {order.status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="order-section products-section">
                            <div className="order-section-head">
                                <h2>Products</h2>
                            </div>

                            <div className="order-products-list">
                                {(order.order_items || []).map((item) => {
                                    const imageUrl = getProductImageUrl(item.product?.image || '');
                                    const itemSubtotal = Number(item.unit_price) * Number(item.quantity);

                                    return (
                                        <article key={item.id} className="order-product-card">
                                            <div className="order-product-image-wrap">
                                                <img
                                                    src={imageUrl}
                                                    alt={item.product?.name || 'Product image'}
                                                    className="order-product-image"
                                                    onError={(event) => {
                                                        event.currentTarget.src = '/images/carousel/image3.jpg';
                                                    }}
                                                />
                                            </div>

                                            <div className="order-product-content">
                                                <h3>{item.product?.name || 'Product unavailable'}</h3>

                                                <div className="order-product-meta">
                                                    <p><span>Selected Size</span><strong>{item.size || '-'}</strong></p>
                                                    <p><span>Quantity</span><strong>{item.quantity}</strong></p>
                                                </div>

                                                <div className="order-product-pricing">
                                                    <p><span>Price</span><strong>{formatPeso(item.unit_price)}</strong></p>
                                                    <p><span>Subtotal</span><strong>{formatPeso(itemSubtotal)}</strong></p>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>

                        {order.rider && order.rider_status === 'accepted' && (
                            <section className="order-section rider-info-section">
                                <div className="order-section-head">
                                    <h2>Delivery Rider Info</h2>
                                </div>

                                <div className="rider-info-grid">
                                    <div className="rider-info-item">
                                        <p className="rider-info-label">Rider Name</p>
                                        <p className="rider-info-value">{order.rider.name}</p>
                                    </div>
                                    <div className="rider-info-item">
                                        <p className="rider-info-label">Phone Number</p>
                                        <p className="rider-info-value">{order.rider.phone}</p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="order-section order-summary-section">
                        <div className="order-section-head">
                            <h2>Summary</h2>
                        </div>

                        <div className="order-summary-list">
                            <div className="order-summary-row">
                                <span>Total Price</span>
                                <strong>{formatPeso(computedTotal)}</strong>
                            </div>
                            <div className="order-summary-row">
                                <span>Payment Method</span>
                                <strong>{paymentLabel(order.payment_method)}</strong>
                            </div>
                            <div className="order-summary-row order-summary-row--status">
                                <span>Status</span>
                                <span className={`status ${normalizedStatusClass}`}>{order.status}</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
