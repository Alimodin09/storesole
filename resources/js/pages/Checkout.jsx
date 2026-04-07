import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { clearCart, getCartItems } from '../utils/cart.js';
import { formatPeso } from '../utils/format.js';
import { isAuthenticated } from '../utils/auth.js';

export default function Checkout() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [placed, setPlaced] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            window.alert('Please log in first before checking out.');
            navigate('/login', { replace: true });
            return;
        }

        setItems(getCartItems());
    }, [navigate]);

    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    }, [items]);

    useEffect(() => {
        if (!placed) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            navigate('/orders', {
                state: {
                    message: 'Order placed successfully.',
                },
            });
        }, 1500);

        return () => window.clearTimeout(timer);
    }, [navigate, placed]);

    const handleSubmitOrder = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!isAuthenticated()) {
            window.alert('Please log in first before checking out.');
            navigate('/login');
            return;
        }

        if (items.length === 0) {
            setErrorMessage('Your cart is empty.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/orders', {
                items: items.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    size: item.size,
                })),
                payment_method: paymentMethod,
            });

            clearCart();
            setPlaced(true);
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Unable to place your order.');
        } finally {
            setLoading(false);
        }
    };

    if (placed) {
        return (
            <section className="page page--checkout">
                <div className="container checkout-shell">
                    <div className="checkout-success">
                        <h1>Order Placed Successfully</h1>
                        <p>Your order is now marked as <strong>Pending</strong>. You can track it in My Orders.</p>
                        <p className="checkout-note">
                            Payment method: {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Cash on Pickup'}
                        </p>
                        <Link to="/orders" className="btn btn--primary">Go to My Orders</Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="page page--checkout">
            <div className="container checkout-shell">
                <div className="checkout-header">
                    <h1>Checkout</h1>
                    <p>Complete your school shoe order using Cash on Delivery or Cash on Pickup.</p>
                </div>

                {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

                <div className="checkout-layout">
                    <form className="checkout-form" onSubmit={handleSubmitOrder}>
                        <div className="checkout-section">
                            <h2>Contact Details</h2>
                            <div className="checkout-grid">
                                <input type="text" placeholder="Full Name" required />
                                <input type="tel" placeholder="Mobile Number" required />
                                <input type="text" placeholder="Delivery Address or Pickup Branch" required />
                            </div>
                        </div>

                        <div className="checkout-section">
                            <h2>Payment Method</h2>
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={(event) => setPaymentMethod(event.target.value)}
                                />
                                <div>
                                    <strong>Cash on Delivery</strong>
                                    <p>Pay in cash when your order arrives.</p>
                                </div>
                            </label>
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cop"
                                    checked={paymentMethod === 'cop'}
                                    onChange={(event) => setPaymentMethod(event.target.value)}
                                />
                                <div>
                                    <strong>Cash on Pickup</strong>
                                    <p>Pay in cash when you pick up your order.</p>
                                </div>
                            </label>
                            <p className="checkout-note">Online card payments, shipping, tracking, SMS, and email notifications are not included.</p>
                        </div>

                        <button type="submit" className="btn btn--primary checkout-submit" disabled={loading}>
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </form>

                    <aside className="checkout-summary">
                        <h3>Order Summary</h3>
                        <div className="checkout-items">
                            {items.map((item) => (
                                <div key={`${item.id}-${item.size}`} className="checkout-item-row">
                                    <div>
                                        <p className="item-name">{item.name}</p>
                                        <p className="item-meta">{item.size} • Qty {item.quantity}</p>
                                    </div>
                                    <span>{formatPeso(Number(item.price) * Number(item.quantity))}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatPeso(subtotal)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{formatPeso(subtotal)}</span>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
