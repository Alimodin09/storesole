import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiUser, FiCreditCard, FiCalendar, FiTruck } from 'react-icons/fi';
import api from '../../utils/api.js';
import { formatPeso, getProductImageUrl } from '../../utils/format.js';

export default function AdminOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [riders, setRiders] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchOrder = async () => {
            setLoading(true);
            setErrorMessage('');

            try {
                const { data } = await api.get(`/orders/${id}`);

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

    useEffect(() => {
        const fetchRiders = async () => {
            try {
                const { data } = await api.get('/riders');
                setRiders(data);
            } catch (error) {
                // Silently fail - riders dropdown just won't populate
            }
        };

        fetchRiders();
    }, []);

    const handleAssignRider = async (riderId) => {
        if (!riderId) return;
        setAssignLoading(true);

        try {
            const { data } = await api.post(`/orders/${id}/assign-rider`, {
                rider_id: Number(riderId),
            });
            setOrder(data.order);
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to assign rider.');
        } finally {
            setAssignLoading(false);
        }
    };

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

    const handleGoBack = () => {
        navigate('/admin/orders');
    };

    if (loading) {
        return (
            <section className="page page--admin-order-details">
                <div className="order-details-loading">
                    <p>Loading order details...</p>
                </div>
            </section>
        );
    }

    if (errorMessage || !order) {
        return (
            <section className="page page--admin-order-details">
                <div className="order-details-error">
                    <h2>Order Not Found</h2>
                    <p>{errorMessage || 'The order you requested does not exist.'}</p>
                    <button className="btn btn-primary" onClick={handleGoBack}>
                        <FiArrowLeft /> Back to Orders
                    </button>
                </div>
            </section>
        );
    }

    const computedTotal = order?.order_items?.length
        ? order.order_items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0)
        : Number(order?.total || 0);

    return (
        <section className="page page--admin-order-details">
            {/* Header */}
            <div className="order-details-header">
                <button 
                    className="btn-back" 
                    onClick={handleGoBack}
                    title="Back to orders list"
                >
                    <FiArrowLeft />
                </button>
                <div className="header-content">
                    <h1 className="order-title">Order ORD-{String(order.id).padStart(3, '0')}</h1>
                    <p className="order-meta">
                        {new Date(order.created_at).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                <div className="status-badge-container">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="order-details-container">
                {/* Left Side - Order Information */}
                <div className="order-details-main">
                    {/* Customer Information */}
                    <div className="order-card">
                        <div className="card-header">
                            <div className="header-icon-wrapper">
                                <FiUser className="card-icon" />
                            </div>
                            <h2 className="card-title">Customer Information</h2>
                        </div>
                        <div className="card-body">
                            <div className="info-row">
                                <span className="info-label">Name</span>
                                <span className="info-value">{order.contact_name || order.user?.name || 'Guest'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email</span>
                                <span className="info-value">{order.user?.email || '-'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Phone</span>
                                <span className="info-value">{order.contact_phone || order.user?.phone || 'No phone number provided'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Address</span>
                                <span className="info-value">{order.delivery_address || order.user?.address || 'No address provided'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-card">
                        <div className="card-header">
                            <div className="header-icon-wrapper">
                                <FiPackage className="card-icon" />
                            </div>
                            <h2 className="card-title">Order Items</h2>
                        </div>
                        <div className="card-body">
                            {!order.order_items || order.order_items.length === 0 ? (
                                <p className="empty-items">No items in this order</p>
                            ) : (
                                <div className="items-list">
                                    {order.order_items.map((item, index) => (
                                        <div key={index} className="item-row">
                                            {item.product?.image && (
                                                <img
                                                    src={getProductImageUrl(item.product.image)}
                                                    alt={item.product?.name || 'Product'}
                                                    className="item-image"
                                                />
                                            )}
                                            <div className="item-details">
                                                <p className="item-name">{item.product?.name || 'Product'}</p>
                                                <p className="item-meta">
                                                    Size: <strong>{item.size || '-'}</strong> | Qty: <strong>{item.quantity}</strong>
                                                </p>
                                            </div>
                                            <div className="item-prices">
                                                <p className="item-price">{formatPeso(item.unit_price)} each</p>
                                                <p className="item-subtotal">{formatPeso(Number(item.unit_price) * Number(item.quantity))}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Order Summary */}
                <div className="order-details-sidebar">
                    {/* Order Summary */}
                    <div className="order-card">
                        <div className="card-header">
                            <div className="header-icon-wrapper">
                                <FiCreditCard className="card-icon" />
                            </div>
                            <h2 className="card-title">Order Summary</h2>
                        </div>
                        <div className="card-body">
                            <div className="summary-section">
                                <div className="summary-row">
                                    <span className="summary-label">Subtotal</span>
                                    <span className="summary-value">{formatPeso(computedTotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Total</span>
                                    <span className="summary-value summary-total">{formatPeso(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="order-card">
                        <div className="card-header">
                            <div className="header-icon-wrapper">
                                <FiCalendar className="card-icon" />
                            </div>
                            <h2 className="card-title">Payment Details</h2>
                        </div>
                        <div className="card-body">
                            <div className="info-row">
                                <span className="info-label">Method</span>
                                <span className="info-value">
                                    {order.payment_method === 'cop' ? 'Cash on Pickup' : 'Cash on Delivery'}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Date</span>
                                <span className="info-value">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Status</span>
                                <span className={`info-value status-${getStatusColor(order.status).replace('status-', '')}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        className="btn btn-outline btn-full" 
                        onClick={handleGoBack}
                    >
                        <FiArrowLeft /> Back to Orders
                    </button>

                    {/* Assign Rider */}
                    <div className="order-card">
                        <div className="card-header">
                            <div className="header-icon-wrapper">
                                <FiTruck className="card-icon" />
                            </div>
                            <h2 className="card-title">Assign Rider</h2>
                        </div>
                        <div className="card-body">
                            {order.rider ? (
                                <div className="rider-assigned-info">
                                    <div className="info-row">
                                        <span className="info-label">Assigned to</span>
                                        <span className="info-value rider-assigned-name">{order.rider.name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Phone</span>
                                        <span className="info-value">{order.rider.phone}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Status</span>
                                        <span className={`info-value rider-status-badge rider-status-badge--${order.rider_status || 'pending'}`}>
                                            {order.rider_status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="rider-assign-form">
                                    {riders.length === 0 ? (
                                        <p className="rider-no-available">No available riders</p>
                                    ) : (
                                        <select
                                            className="rider-select"
                                            onChange={(e) => handleAssignRider(e.target.value)}
                                            disabled={assignLoading}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                {assignLoading ? 'Assigning...' : 'Select a rider'}
                                            </option>
                                            {riders.map((rider) => (
                                                <option key={rider.id} value={rider.id}>
                                                    {rider.name} - {rider.phone}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
