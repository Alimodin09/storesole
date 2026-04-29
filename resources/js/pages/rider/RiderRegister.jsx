import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';

const AUTH_LOGO_PATH = '/images/carousel/sole-logo.png';

export default function RiderRegister() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isPageMounted, setIsPageMounted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsPageMounted(true);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/rider-register', {
                name,
                email,
                phone,
                password,
            });

            navigate('/rider/login', {
                state: {
                    message: 'Account created successfully. You can now log in.',
                },
            });
        } catch (error) {
            const data = error?.response?.data;
            if (data?.errors) {
                const firstError = Object.values(data.errors)[0];
                setErrorMessage(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                setErrorMessage(data?.message || 'Unable to create account.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page--auth page--auth-rider">
            <div className="auth-shell">
                <div className={`auth-card auth-card--admin ${isPageMounted ? 'is-visible' : ''}`}>
                    <div className="auth-card__form-pane">
                        <div className={`auth-form-container ${isPageMounted ? 'is-visible' : ''}`}>
                            <div className="auth-brand-row">
                                <Link to="/" className="auth-brand-link" aria-label="Sole Home">
                                    <img src={AUTH_LOGO_PATH} alt="Sole logo" className="auth-logo-image" />
                                    <span className="auth-brand-text">Sole</span>
                                </Link>
                            </div>

                            <div className="auth-header auth-header--premium auth-header--centered">
                                <h1 className="auth-heading">Rider Registration</h1>
                                <p className="auth-subtitle">Create your rider account to start delivering</p>
                            </div>

                            {errorMessage && (
                                <div className="auth-alert auth-alert--error">{errorMessage}</div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group form-group--auth">
                                    <label htmlFor="rider-reg-name" className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        id="rider-reg-name"
                                        className="form-input form-input--premium"
                                        placeholder="Your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group form-group--auth">
                                    <label htmlFor="rider-reg-email" className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        id="rider-reg-email"
                                        className="form-input form-input--premium"
                                        placeholder="rider@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group form-group--auth">
                                    <label htmlFor="rider-reg-phone" className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="rider-reg-phone"
                                        className="form-input form-input--premium"
                                        placeholder="09171234567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group form-group--auth">
                                    <label htmlFor="rider-reg-password" className="form-label">Password</label>
                                    <div className="password-field-wrap">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="rider-reg-password"
                                            className="form-input form-input--premium form-input--with-toggle"
                                            placeholder="Create a secure password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword((c) => !c)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.8 2.92-4.94 5.3-6.32"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.66 0 1.28-.18 1.81-.48"/></svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group form-group--auth">
                                    <label htmlFor="rider-reg-confirm" className="form-label">Confirm Password</label>
                                    <div className="password-field-wrap">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="rider-reg-confirm"
                                            className="form-input form-input--premium form-input--with-toggle"
                                            placeholder="Re-enter your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword((c) => !c)}
                                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showConfirmPassword ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.8 2.92-4.94 5.3-6.32"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.66 0 1.28-.18 1.81-.48"/></svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn--primary btn--premium auth-submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Account...' : 'Create Rider Account'}
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>Already a rider?</span>
                            </div>

                            <div className="auth-footer-section">
                                <Link to="/rider/login" className="auth-footer-inline-link">
                                    Sign In to Rider Portal
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
