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
                <div className="orders-header">
                    <h1>Order Details</h1>
                    <p>Review your selected order information.</p>
                </div>

                <div className="order-card order-details-card">
                    <div className="order-details-grid">
                        <p><strong>Order ID:</strong> #{order.id}</p>
                        <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                        <p>
                            <strong>Status:</strong>{' '}
                            <span className={`status ${String(order.status).toLowerCase().replace(/ /g, '-')}`}>
                                {order.status}
                            </span>
                        </p>
                        <p><strong>Payment Method:</strong> {paymentLabel(order.payment_method)}</p>
                    </div>

                    <div className="order-items-table-wrap">
                        <table className="order-items-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Product</th>
                                    <th>Size</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(order.order_items || []).map((item) => {
                                    const imageUrl = getProductImageUrl(item.product?.image || '');
                                    const itemSubtotal = Number(item.unit_price) * Number(item.quantity);

                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <img
                                                    src={imageUrl}
                                                    alt={item.product?.name || 'Product image'}
                                                    className="order-item-image"
                                                    onError={(event) => {
                                                        event.currentTarget.src = '/images/carousel/image3.jpg';
                                                    }}
                                                />
                                            </td>
                                            <td>{item.product?.name || 'Product unavailable'}</td>
                                            <td>{item.size || '-'}</td>
                                            <td>{item.quantity}</td>
                                            <td>{formatPeso(item.unit_price)}</td>
                                            <td>{formatPeso(itemSubtotal)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="order-footer">
                        <span className="order-total">Total: {formatPeso(computedTotal)}</span>
                        <Link to="/orders" className="btn-small">Back to Orders</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
