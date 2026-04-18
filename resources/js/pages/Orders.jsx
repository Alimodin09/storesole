import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { formatPeso } from '../utils/format.js';

const statusTabs = ['All', 'Pending', 'Processing', 'Completed'];

function getStatusClass(status) {
    return String(status || '').toLowerCase().replace(/\s+/g, '-');
}

export default function Orders() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        let active = true;

        const fetchOrders = async () => {
            setLoading(true);
            setErrorMessage('');

            try {
                const { data } = await api.get('/user/orders');
                if (active) {
                    setOrders(data);
                }
            } catch (error) {
                if (active) {
                    setErrorMessage(error?.response?.data?.message || 'Failed to load your orders.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();

        return () => {
            active = false;
        };
    }, []);

    const filteredOrders = useMemo(() => {
        if (activeTab === 'All') {
            return orders;
        }

        return orders.filter((order) => String(order.status).toLowerCase() === activeTab.toLowerCase());
    }, [orders, activeTab]);

    return (
        <section className="page page--orders">
            <div className="container orders-shell">
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <p>Track your orders and view history</p>
                </div>

                {location.state?.message && <div className="alert alert-success">{location.state.message}</div>}
                {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

                <div className="orders-filters" role="tablist" aria-label="Order status filters">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab}
                            className={`orders-filter-tab ${activeTab === tab ? 'is-active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="no-orders">
                        <p>Loading your orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="no-orders">
                        <p>No orders found for this filter.</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <article
                                key={order.id}
                                className="order-card"
                                onClick={() => navigate(`/orders/${order.id}`)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        navigate(`/orders/${order.id}`);
                                    }
                                }}
                                role="link"
                                tabIndex={0}
                            >
                                <div className="order-card-head">
                                    <div className="order-meta">
                                        <h3>Order #{order.id}</h3>
                                        <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`status ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="order-card-body">
                                    <p className="order-total-label">Total</p>
                                    <p className="order-total">{formatPeso(order.total)}</p>
                                </div>

                                <div className="order-card-footer">
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="btn-small orders-view-btn"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
