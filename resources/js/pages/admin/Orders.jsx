import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiBox, FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';
import api from '../../utils/api.js';
import { formatPeso, getProductImageUrl } from '../../utils/format.js';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
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
        // Navigate to order detail page
        navigate(`/admin/orders/${orderId}`);
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
                    <p>Manage customer orders and track their status</p>
                </div>
            </div>

            {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

            {/* Summary Cards */}
            <div className="orders-info-cards">
                <div className="info-card">
                    <p className="info-label"><FiBox className="card-icon" /> Total Orders</p>
                    <p className="info-value">{orders.length}</p>
                </div>
                <div className="info-card">
                    <p className="info-label"><FiClock className="card-icon" /> Pending</p>
                    <p className="info-value">{orders.filter(o => o.status === 'Pending').length}</p>
                </div>
                <div className="info-card">
                    <p className="info-label"><FiTruck className="card-icon" /> Ready for Pickup</p>
                    <p className="info-value">{orders.filter(o => o.status === 'Ready for Pickup').length}</p>
                </div>
                <div className="info-card">
                    <p className="info-label"><FiCheckCircle className="card-icon" /> Completed</p>
                    <p className="info-value">{orders.filter(o => o.status === 'Completed').length}</p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="orders-table-wrapper">
                {loading ? (
                    <div className="loading">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <p>No orders yet. Customer orders will appear here.</p>
                    </div>
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
                            <th>Actions</th>
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
                                <td className="amount"><strong>{formatPeso(order.total)}</strong></td>
                                <td>
                                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="order-date">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="order-actions-inline">
                                    <button
                                        className="btn-action"
                                        type="button"
                                        onClick={() => handleSelectOrder(order.id)}
                                        title={`View details for order ${order.id}`}
                                    >
                                        View
                                    </button>
                                    <select
                                        className="status-select"
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        title="Update order status"
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
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
                        <div>
                            <strong>Customer Name</strong>
                            <p>{selectedOrder.user?.name || 'Guest'}</p>
                        </div>
                        <div>
                            <strong>Email</strong>
                            <p>{selectedOrder.user?.email || '-'}</p>
                        </div>
                        <div>
                            <strong>Status</strong>
                            <p><span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                        </div>
                        <div>
                            <strong>Order Date</strong>
                            <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <strong>Payment Method</strong>
                            <p>{selectedOrder.payment_method === 'cop' ? 'Cash on Pickup' : 'Cash on Delivery'}</p>
                        </div>
                        <div>
                            <strong>Total Amount</strong>
                            <p><strong>{formatPeso(selectedOrder.total)}</strong></p>
                        </div>
                    </div>

                    <div className="order-detail-items">
                        <h3>Order Items</h3>
                        {!selectedOrder.order_items?.length ? (
                            <p className="section-hint">No items found in this order.</p>
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
                                                    <td><strong>{formatPeso(subtotal)}</strong></td>
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
