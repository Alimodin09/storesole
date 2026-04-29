import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { clearCart, getCartChangedEventName, getCartItems } from '../utils/cart.js';
import { formatPeso, getProductImageUrl } from '../utils/format.js';
import { getAuthChangedEventName, isAuthenticated } from '../utils/auth.js';

function getPaymentLabel(method) {
    return method === 'cop' ? 'Cash on Pickup' : 'Cash on Delivery';
}

const STEPS = ['Review', 'Details', 'Payment'];

export default function Checkout() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [placed, setPlaced] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [activeStep, setActiveStep] = useState(0);

    const [fields, setFields] = useState({
        fullName: '',
        mobile: '',
        address: '',
    });

    useEffect(() => {
        const syncCheckoutItems = () => {
            if (!isAuthenticated()) {
                setItems([]);
                navigate('/login', { replace: true });
                return;
            }
            setItems(getCartItems());
        };

        const authEvent = getAuthChangedEventName();
        const cartEvent = getCartChangedEventName();
        syncCheckoutItems();
        window.addEventListener(authEvent, syncCheckoutItems);
        window.addEventListener(cartEvent, syncCheckoutItems);

        return () => {
            window.removeEventListener(authEvent, syncCheckoutItems);
            window.removeEventListener(cartEvent, syncCheckoutItems);
        };
    }, [navigate]);

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
        [items]
    );

    const itemsCount = useMemo(
        () => items.reduce((count, item) => count + Number(item.quantity), 0),
        [items]
    );

    useEffect(() => {
        if (!placed) return undefined;
        const timer = window.setTimeout(() => {
            navigate('/orders', { state: { message: 'Order placed successfully.' } });
        }, 1800);
        return () => window.clearTimeout(timer);
    }, [navigate, placed]);

    const handleFieldChange = (e) => {
        setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

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
                contact_name: fields.fullName,
                contact_phone: fields.mobile,
                delivery_address: fields.address,
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
                <div className="container checkout-success-shell">
                    <div className="success-ring">
                        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="success-checkmark" aria-hidden="true">
                            <circle cx="26" cy="26" r="25" stroke="currentColor" strokeWidth="2" />
                            <path d="M14 26.5L22 34.5L38 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="success-content">
                        <p className="success-eyebrow">Order confirmed</p>
                        <h1>You're all set!</h1>
                        <p className="success-body">
                            Your order is marked as <strong>Pending</strong>. We'll prepare it right away.
                        </p>
                        <div className="success-meta-row">
                            <span className="success-badge">
                                {getPaymentLabel(paymentMethod)}
                            </span>
                            <span className="success-badge success-badge--items">
                                {itemsCount} item{itemsCount !== 1 ? 's' : ''} · {formatPeso(subtotal)}
                            </span>
                        </div>
                        <Link to="/orders" className="btn btn--primary success-cta">
                            Track My Order
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="page page--checkout">
            <div className="container checkout-shell">

                {/* Top navigation bar */}
                <nav className="checkout-topbar" aria-label="Checkout navigation">
                    <Link to="/cart" className="checkout-back-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Back to Cart</span>
                    </Link>

                    <ol className="checkout-stepper" aria-label="Checkout steps">
                        {STEPS.map((step, i) => (
                            <li
                                key={step}
                                className={[
                                    'checkout-stepper__step',
                                    i === activeStep ? 'is-active' : '',
                                    i < activeStep ? 'is-done' : '',
                                ].filter(Boolean).join(' ')}
                                aria-current={i === activeStep ? 'step' : undefined}
                            >
                                <span className="stepper-dot" aria-hidden="true">
                                    {i < activeStep ? (
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5L4.2 7.2L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <span>{i + 1}</span>
                                    )}
                                </span>
                                <span className="stepper-label">{step}</span>
                                {i < STEPS.length - 1 && <span className="stepper-connector" aria-hidden="true" />}
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Page header */}
                <header className="checkout-header">
                    <h1>Checkout</h1>
                    <p>Fill in your details, pick a payment method, and confirm your order.</p>
                </header>

                {errorMessage && (
                    <div className="checkout-alert" role="alert">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            <circle cx="8" cy="11" r="0.7" fill="currentColor" />
                        </svg>
                        {errorMessage}
                    </div>
                )}

                <div className="checkout-layout">
                    {/* Left: Form */}
                    <form className="checkout-form" onSubmit={handleSubmitOrder} noValidate>

                        {/* Customer info section */}
                        <fieldset className="checkout-fieldset">
                            <legend className="checkout-fieldset__legend">
                                <span className="legend-num" aria-hidden="true">1</span>
                                <div>
                                    <strong>Customer Information</strong>
                                    <span>Who's receiving this order?</span>
                                </div>
                            </legend>

                            <div className="form-grid">
                                <div className="form-group form-group--full">
                                    <label className="form-label" htmlFor="checkout-full-name">Full Name</label>
                                    <input
                                        className="form-input"
                                        id="checkout-full-name"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="e.g. Juan dela Cruz"
                                        value={fields.fullName}
                                        onChange={handleFieldChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="checkout-mobile">Mobile Number</label>
                                    <div className="input-with-prefix">
                                        <span className="input-prefix" aria-hidden="true">+63</span>
                                        <input
                                            className="form-input form-input--prefixed"
                                            id="checkout-mobile"
                                            name="mobile"
                                            type="tel"
                                            autoComplete="tel"
                                            placeholder="9XX XXX XXXX"
                                            value={fields.mobile}
                                            onChange={handleFieldChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group form-group--full">
                                    <label className="form-label" htmlFor="checkout-address">
                                        Delivery Address / Pickup Details
                                    </label>
                                    <input
                                        className="form-input"
                                        id="checkout-address"
                                        name="address"
                                        type="text"
                                        autoComplete="street-address"
                                        placeholder="Street, barangay, city — or pickup branch name"
                                        value={fields.address}
                                        onChange={handleFieldChange}
                                        required
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Payment section */}
                        <fieldset className="checkout-fieldset">
                            <legend className="checkout-fieldset__legend">
                                <span className="legend-num" aria-hidden="true">2</span>
                                <div>
                                    <strong>Payment Method</strong>
                                    <span>How do you want to pay?</span>
                                </div>
                            </legend>

                            <div className="payment-options" role="radiogroup" aria-label="Payment method">
                                {[
                                    {
                                        value: 'cod',
                                        icon: (
                                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                                                <rect x="1.5" y="5.5" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                                                <path d="M1.5 9.5H20.5" stroke="currentColor" strokeWidth="1.5" />
                                                <rect x="4" y="13" width="4" height="2" rx="0.5" fill="currentColor" />
                                            </svg>
                                        ),
                                        title: 'Cash on Delivery',
                                        desc: 'Pay when your order arrives at your door.',
                                    },
                                    {
                                        value: 'cop',
                                        icon: (
                                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                                                <path d="M11 2L13.6 7.8L20 8.7L15.5 13.1L16.7 19.5L11 16.3L5.3 19.5L6.5 13.1L2 8.7L8.4 7.8L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                            </svg>
                                        ),
                                        title: 'Cash on Pickup',
                                        desc: 'Pick up and pay at the branch.',
                                    },
                                ].map(({ value, icon, title, desc }) => (
                                    <label
                                        key={value}
                                        className={`payment-card ${paymentMethod === value ? 'is-selected' : ''}`}
                                        htmlFor={`payment-${value}`}
                                    >
                                        <span className="payment-card__icon">{icon}</span>
                                        <span className="payment-card__content">
                                            <strong>{title}</strong>
                                            <span>{desc}</span>
                                        </span>
                                        <span className="payment-card__radio" aria-hidden="true">
                                            <span className="radio-inner" />
                                        </span>
                                        <input
                                            type="radio"
                                            id={`payment-${value}`}
                                            name="paymentMethod"
                                            value={value}
                                            checked={paymentMethod === value}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="sr-only"
                                        />
                                    </label>
                                ))}
                            </div>

                            <p className="checkout-disclaimer">
                                Online card payments, real-time tracking, SMS &amp; email notifications are not available yet.
                            </p>
                        </fieldset>

                        {/* Submit */}
                        <div className="checkout-submit-row">
                            <div className="submit-total-preview" aria-label={`Order total: ${formatPeso(subtotal)}`}>
                                <span>Total</span>
                                <strong>{formatPeso(subtotal)}</strong>
                            </div>
                            <button
                                type="submit"
                                className="btn btn--primary checkout-submit"
                                disabled={loading}
                                aria-busy={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner" aria-hidden="true" />
                                        Placing Order…
                                    </>
                                ) : (
                                    <>
                                        Place Order
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Right: Order summary */}
                    <aside className="order-summary" aria-label="Order summary">
                        <div className="order-summary__header">
                            <h2>Order Summary</h2>
                            <span className="order-summary__count">{itemsCount} item{itemsCount !== 1 ? 's' : ''}</span>
                        </div>

                        <ul className="order-items" aria-label="Items in your order">
                            {items.map((item) => (
                                <li key={`${item.id}-${item.size}`} className="order-item">
                                    <div className="order-item__image-wrap">
                                        <img
                                            src={getProductImageUrl(item.image)}
                                            alt={item.name}
                                            className="order-item__image"
                                            loading="lazy"
                                        />
                                        <span className="order-item__qty-badge" aria-label={`Quantity: ${item.quantity}`}>
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="order-item__info">
                                        <p className="order-item__name">{item.name}</p>
                                        <p className="order-item__meta">Size {item.size}</p>
                                    </div>
                                    <p className="order-item__price">
                                        {formatPeso(Number(item.price) * Number(item.quantity))}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <div className="order-totals">
                            <div className="totals-row">
                                <span>Subtotal</span>
                                <span>{formatPeso(subtotal)}</span>
                            </div>
                            <div className="totals-row">
                                <span>Delivery fee</span>
                                <span className="totals-row__free">Free</span>
                            </div>
                            <div className="totals-row totals-row--divider">
                                <span>Payment</span>
                                <span>{getPaymentLabel(paymentMethod)}</span>
                            </div>
                            <div className="totals-row totals-row--total">
                                <span>Total</span>
                                <strong>{formatPeso(subtotal)}</strong>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}