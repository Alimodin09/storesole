import React, { useEffect, useState } from 'react';
import { Package, Check, X, User, Phone, CreditCard, Truck, Clock, CheckCircle, ShoppingBag, MapPin, PhoneCall } from 'lucide-react';
import api from '../../utils/api.js';
import { formatPeso, getProductImageUrl } from '../../utils/format.js';

export default function RiderDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    const fetchOrders = async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            const { data } = await api.get('/rider/orders');
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

    const handleAccept = async (orderId) => {
        setActionLoading(orderId);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const { data } = await api.post(`/rider/orders/${orderId}/accept`);
            setSuccessMessage(`Order #${orderId} accepted.`);
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, rider_status: 'accepted', status: data.order?.status || o.status } : o))
            );
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to accept order.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (orderId) => {
        setActionLoading(orderId);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await api.post(`/rider/orders/${orderId}/reject`);
            setSuccessMessage(`Order #${orderId} rejected.`);
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to reject order.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeliver = async (orderId) => {
        setActionLoading(orderId);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const { data } = await api.post(`/rider/orders/${orderId}/deliver`);
            setSuccessMessage(`Order #${orderId} marked as delivered.`);
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, rider_status: 'delivered', status: data.order?.status || 'Delivered' } : o))
            );
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to mark as delivered.');
        } finally {
            setActionLoading(null);
        }
    };

    const pendingOrders = orders.filter((o) => o.rider_status === 'pending');
    const activeOrders = orders.filter((o) => o.rider_status === 'accepted');
    const completedOrders = orders.filter((o) => o.rider_status === 'delivered');

    const tabs = [
        { key: 'pending', label: 'Pending', count: pendingOrders.length, icon: Clock },
        { key: 'active', label: 'Active Deliveries', count: activeOrders.length, icon: Truck },
        { key: 'completed', label: 'Completed', count: completedOrders.length, icon: CheckCircle },
    ];

    const currentOrders =
        activeTab === 'pending' ? pendingOrders :
        activeTab === 'active' ? activeOrders :
        completedOrders;

    const paymentLabel = (method) => {
        if (method === 'cop') return 'Cash on Pickup';
        return 'Cash on Delivery';
    };

    const getStatusBadgeClass = (riderStatus) => {
        if (riderStatus === 'pending') return 'rider-order-badge--pending';
        if (riderStatus === 'accepted') return 'rider-order-badge--active';
        if (riderStatus === 'delivered') return 'rider-order-badge--delivered';
        return '';
    };

    const getStatusLabel = (riderStatus) => {
        if (riderStatus === 'pending') return 'Pending';
        if (riderStatus === 'accepted') return 'In Transit';
        if (riderStatus === 'delivered') return 'Delivered';
        return riderStatus;
    };

    return (
        <section className="page page--rider-dashboard">
            <div className="rider-dashboard-header">
                <h1 className="rider-dashboard-title">My Deliveries</h1>
                <p className="rider-dashboard-subtitle">Orders assigned to you for delivery</p>
            </div>

            {successMessage && (
                <div className="rider-alert rider-alert--success">{successMessage}</div>
            )}
            {errorMessage && (
                <div className="rider-alert rider-alert--error">{errorMessage}</div>
            )}

            {/* Tabs */}
            <div className="rider-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`rider-tab ${activeTab === tab.key ? 'rider-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                            <span className="rider-tab-count">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="rider-loading">
                    <p>Loading assigned orders...</p>
                </div>
            ) : currentOrders.length === 0 ? (
                <div className="rider-empty">
                    <Package size={48} strokeWidth={1.5} className="rider-empty-icon" />
                    <h2>
                        {activeTab === 'pending' && 'No pending deliveries'}
                        {activeTab === 'active' && 'No active deliveries'}
                        {activeTab === 'completed' && 'No completed deliveries'}
                    </h2>
                    <p>
                        {activeTab === 'pending' && 'You have no orders waiting for your response.'}
                        {activeTab === 'active' && 'You have no deliveries in progress.'}
                        {activeTab === 'completed' && 'You have not completed any deliveries yet.'}
                    </p>
                </div>
            ) : (
                <div className="rider-orders-grid">
                    {currentOrders.map((order) => (
                        <div key={order.id} className="rider-order-card">
                            <div className="rider-order-card__header">
                                <span className="rider-order-id">
                                    Order #{order.id}
                                </span>
                                <span className={`rider-order-badge ${getStatusBadgeClass(order.rider_status)}`}>
                                    {getStatusLabel(order.rider_status)}
                                </span>
                            </div>

                            <div className="rider-order-card__body">
                                {/* Customer Info */}
                                <div className="rider-order-info-row">
                                    <User size={16} className="rider-order-info-icon" />
                                    <div>
                                        <span className="rider-order-info-label">Customer</span>
                                        <span className="rider-order-info-value">
                                            {order.user?.name || 'Unknown'}
                                        </span>
                                    </div>
                                </div>

                                <div className="rider-order-info-row">
                                    <Phone size={16} className="rider-order-info-icon" />
                                    <div>
                                        <span className="rider-order-info-label">Phone</span>
                                        <span className="rider-order-info-value">
                                            {order.contact_phone || order.user?.phone || 'No phone available'}
                                        </span>
                                    </div>
                                </div>

                                <div className="rider-order-info-row">
                                    <MapPin size={16} className="rider-order-info-icon" />
                                    <div>
                                        <span className="rider-order-info-label">Delivery Address</span>
                                        <span className="rider-order-info-value">
                                            {order.delivery_address || order.user?.address || 'No address provided'}
                                        </span>
                                    </div>
                                </div>

                                {(order.contact_phone || order.user?.phone) && (
                                    <a
                                        href={`tel:${order.contact_phone || order.user.phone}`}
                                        className="rider-call-btn"
                                    >
                                        <PhoneCall size={14} />
                                        Call Customer
                                    </a>
                                )}

                                {/* Payment & Status */}
                                <div className="rider-order-info-row">
                                    <CreditCard size={16} className="rider-order-info-icon" />
                                    <div>
                                        <span className="rider-order-info-label">Payment</span>
                                        <span className="rider-order-info-value">
                                            {paymentLabel(order.payment_method)}
                                        </span>
                                    </div>
                                </div>

                                <div className="rider-order-info-row">
                                    <ShoppingBag size={16} className="rider-order-info-icon" />
                                    <div>
                                        <span className="rider-order-info-label">Order Status</span>
                                        <span className="rider-order-info-value">{order.status}</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="rider-order-info-row">
                                    <Package size={16} className="rider-order-info-icon" />
                                    <div>
                                        <span className="rider-order-info-label">Total</span>
                                        <span className="rider-order-info-value rider-order-info-value--highlight">
                                            {formatPeso(order.total)}
                                        </span>
                                    </div>
                                </div>

                                {/* Products */}
                                {order.order_items && order.order_items.length > 0 && (
                                    <div className="rider-order-products">
                                        <span className="rider-order-products-title">Products</span>
                                        {order.order_items.map((item, idx) => (
                                            <div key={idx} className="rider-order-product-row">
                                                {item.product?.image && (
                                                    <img
                                                        src={getProductImageUrl(item.product.image)}
                                                        alt={item.product?.name || 'Product'}
                                                        className="rider-order-product-img"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                )}
                                                <div className="rider-order-product-info">
                                                    <span className="rider-order-product-name">
                                                        {item.product?.name || 'Product'}
                                                    </span>
                                                    <span className="rider-order-product-meta">
                                                        Size: {item.size || '-'} | Qty: {item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {order.rider_status === 'pending' && (
                                <div className="rider-order-card__actions">
                                    <button
                                        className="btn rider-btn rider-btn--accept"
                                        onClick={() => handleAccept(order.id)}
                                        disabled={actionLoading === order.id}
                                    >
                                        <Check size={16} />
                                        {actionLoading === order.id ? 'Processing...' : 'Accept'}
                                    </button>
                                    <button
                                        className="btn rider-btn rider-btn--reject"
                                        onClick={() => handleReject(order.id)}
                                        disabled={actionLoading === order.id}
                                    >
                                        <X size={16} />
                                        {actionLoading === order.id ? 'Processing...' : 'Reject'}
                                    </button>
                                </div>
                            )}

                            {order.rider_status === 'accepted' && (
                                <div className="rider-order-card__actions">
                                    <button
                                        className="btn rider-btn rider-btn--deliver"
                                        onClick={() => handleDeliver(order.id)}
                                        disabled={actionLoading === order.id}
                                    >
                                        <Truck size={16} />
                                        {actionLoading === order.id ? 'Processing...' : 'Mark as Delivered'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
