import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCartChangedEventName, getCartItems, removeCartItem, setCartItems, updateCartItem } from '../utils/cart.js';
import { formatPeso, getProductImageUrl } from '../utils/format.js';
import { getAuthChangedEventName, isAuthenticated } from '../utils/auth.js';

export default function Cart() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);

    useEffect(() => {
        const syncItems = () => {
            setItems(getCartItems());
        };

        const authEvent = getAuthChangedEventName();
        const cartEvent = getCartChangedEventName();

        syncItems();

        window.addEventListener(authEvent, syncItems);
        window.addEventListener(cartEvent, syncItems);

        return () => {
            window.removeEventListener(authEvent, syncItems);
            window.removeEventListener(cartEvent, syncItems);
        };
    }, []);

    const refreshCart = (nextItems) => {
        setItems(setCartItems(nextItems));
    };

    const updateQuantity = (productId, size, nextQuantity) => {
        if (nextQuantity <= 0) {
            refreshCart(removeCartItem(productId, size));
            return;
        }

        refreshCart(updateCartItem(productId, size, nextQuantity));
    };

    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    }, [items]);

    const handleProceedToCheckout = (event) => {
        if (isAuthenticated()) {
            return;
        }

        event.preventDefault();
        window.alert('Please log in first before checking out.');
        navigate('/login');
    };

    return (
        <section className="page page--cart">
            <div className="container cart-shell">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <p>Review your selected school shoes before checkout.</p>
                </div>

                {items.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty.</p>
                        <Link to="/products" className="btn btn--primary">Continue Shopping</Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {items.map((item) => (
                                <div key={`${item.id}-${item.size}`} className="cart-item">
                                    <img
                                        src={getProductImageUrl(item.image)}
                                        alt={item.name}
                                        className="item-image"
                                        loading="lazy"
                                        onError={(event) => {
                                            event.currentTarget.src = '/images/carousel/image3.jpg';
                                        }}
                                    />
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p className="item-meta">Size: {item.size}</p>
                                        <p className="item-meta">Stock: {item.stock} available</p>
                                        <p className="item-price">{formatPeso(item.price)}</p>
                                    </div>
                                    <div className="item-quantity">
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.id, item.size, Number(item.quantity) - 1)}
                                            aria-label={`Decrease quantity for ${item.name}`}
                                        >
                                            -
                                        </button>
                                        <input type="number" value={item.quantity} readOnly />
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.id, item.size, Number(item.quantity) + 1)}
                                            aria-label={`Increase quantity for ${item.name}`}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="item-total">{formatPeso(Number(item.price) * Number(item.quantity))}</p>
                                    <button type="button" className="remove-btn" onClick={() => updateQuantity(item.id, item.size, 0)}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h3>Order Summary</h3>
                            <p className="summary-note">Payment options: Cash on Delivery or Cash on Pickup only.</p>
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>{formatPeso(subtotal)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>{formatPeso(subtotal)}</span>
                            </div>
                            <Link to="/checkout" className="btn btn--primary summary-cta" onClick={handleProceedToCheckout}>Proceed to Checkout</Link>
                            <Link to="/products" className="btn btn--secondary summary-cta">Continue Shopping</Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
