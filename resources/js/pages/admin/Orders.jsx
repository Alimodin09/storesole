import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api.js';
import { formatPeso, getProductImageUrl } from '../../utils/format.js';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedOrderId, setSelectedOrderId] = useState(() => Number(searchParams.get('orderId')) || null);

    const statusOptions = ['Pending', 'Processing', 'Ready for Pickup', 'Delivered', 'Completed'];

    const fetchOrders = async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        const fromQuery = Number(searchParams.get('orderId')) || null;
        setSelectedOrderId(fromQuery);
    }, [searchParams]);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}`, { status: newStatus });
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to update order status.');
        }
    };

    const handleSelectOrder = (orderId) => {
        setSelectedOrderId(orderId);
        setSearchParams({ orderId: String(orderId) }, { replace: true });
    };

    const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;

    const getStatusColor = (status) => {
        const statusColors = {
            'Pending': 'status-pending',
            'Processing': 'status-processing',
            'Ready for Pickup': 'status-ready',
            'Delivered': 'status-delivered',
            'Completed': 'status-completed'
        };
        return statusColors[status] || 'status-default';
    };

    return (
        <section className="page page--admin-orders">
            <div className="admin-page-header">
                <div>
                    <h1>Orders</h1>
                    <p>Manage customer orders and update status</p>
                </div>
            </div>

            {errorMessage && <p className="auth-error">{errorMessage}</p>}

            <div className="orders-info-cards">
                <div className="info-card">
                    <p className="info-label">Total Orders</p>
                    <p className="info-value">{orders.length}</p>
                </div>
                <div className="info-card">
                    <p className="info-label">Pending Orders</p>
                    <p className="info-value">{orders.filter(o => o.status === 'Pending').length}</p>
                </div>
                <div className="info-card">
                    <p className="info-label">Ready for Pickup</p>
                    <p className="info-value">{orders.filter(o => o.status === 'Ready for Pickup').length}</p>
                </div>
                <div className="info-card">
                    <p className="info-label">Completed</p>
                    <p className="info-value">{orders.filter(o => o.status === 'Completed').length}</p>
                </div>
            </div>

            <div className="orders-table-wrapper">
                {loading ? (
                    <div className="loading">Loading orders...</div>
                ) : (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Payment</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td className="order-id"><strong>ORD-{String(order.id).padStart(3, '0')}</strong></td>
                                <td>
                                    <div className="customer-info">
                                        <div>{order.user?.name || 'Guest'}</div>
                                        <small>{order.user?.email || '-'}</small>
                                    </div>
                                </td>
                                <td className="items-count">{order.order_items?.length || 0} item(s)</td>
                                <td className="payment-method">{order.payment_method === 'cop' ? 'Cash on Pickup' : 'Cash on Delivery'}</td>
                                <td className="amount">{formatPeso(order.total)}</td>
                                <td>
                                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="order-date">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="action-cell">
                                    <div className="order-actions-inline">
                                        <button
                                            className="btn-action"
                                            type="button"
                                            onClick={() => handleSelectOrder(order.id)}
                                        >
                                            View
                                        </button>
                                        <select
                                            className="status-select"
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        >
                                            {statusOptions.map(status => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>

            {selectedOrder && (
                <div className="order-detail-panel">
                    <div className="order-detail-panel__header">
                        <h2>Order Details</h2>
                        <span className="order-id">ORD-{String(selectedOrder.id).padStart(3, '0')}</span>
                    </div>

                    <div className="order-detail-grid">
                        <p><strong>Customer:</strong> {selectedOrder.user?.name || 'Guest'}</p>
                        <p><strong>Email:</strong> {selectedOrder.user?.email || '-'}</p>
                        <p><strong>Status:</strong> {selectedOrder.status}</p>
                        <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                        <p><strong>Payment:</strong> {selectedOrder.payment_method === 'cop' ? 'Cash on Pickup' : 'Cash on Delivery'}</p>
                        <p><strong>Total:</strong> {formatPeso(selectedOrder.total)}</p>
                    </div>

                    <div className="order-detail-items">
                        <h3>Items</h3>
                        {!selectedOrder.order_items?.length ? (
                            <p className="section-hint">No line items found.</p>
                        ) : (
                            <div className="order-detail-items-table-wrap">
                                <table className="order-detail-items-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Size</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.order_items.map((item) => {
                                            const subtotal = Number(item.unit_price) * Number(item.quantity);

                                            return (
                                                <tr key={item.id}>
                                                    <td>
                                                        <img
                                                            className="product-thumbnail"
                                                            src={getProductImageUrl(item.product?.image || '')}
                                                            alt={item.product?.name || 'Product image'}
                                                            onError={(event) => {
                                                                event.currentTarget.src = '/images/carousel/image3.jpg';
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{item.product?.name || 'Product unavailable'}</td>
                                                    <td>{item.product?.category || '-'}</td>
                                                    <td>{item.size || '-'}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{formatPeso(item.unit_price)}</td>
                                                    <td>{formatPeso(subtotal)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
