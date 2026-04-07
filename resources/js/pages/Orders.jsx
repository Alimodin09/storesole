import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import api from '../utils/api.js';
import { formatPeso } from '../utils/format.js';

export default function Orders() {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

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

    return (
        <section className="page page--orders">
            <div className="container orders-shell">
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <p>View your order history and track each order status.</p>
                </div>

                {location.state?.message && <div className="alert alert-success">{location.state.message}</div>}
                {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

                <div className="orders-status-guide">
                    <span className="status pending">Pending</span>
                    <span className="status processing">Processing</span>
                    <span className="status ready-for-pickup">Ready for Pickup</span>
                    <span className="status delivered">Delivered</span>
                    <span className="status completed">Completed</span>
                </div>

                {loading ? (
                    <div className="no-orders">
                        <p>Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="no-orders">
                        <p>You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div>
                                        <h3>Order #{order.id}</h3>
                                        <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`status ${order.status.toLowerCase().replace(/ /g, '-')}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="order-footer">
                                    <span className="order-total">Total: {formatPeso(order.total)}</span>
                                    <Link to={`/orders/${order.id}`} className="btn-small">View Details</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
