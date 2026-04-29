import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api.js';
import { setAuthUser } from '../../utils/auth.js';

const AUTH_LOGO_PATH = '/images/carousel/sole-logo.png';

export default function RiderLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isPageMounted, setIsPageMounted] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const stateMessage = location.state?.message || '';

    useEffect(() => {
        setIsPageMounted(true);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/rider-login', { email, password });
            setAuthUser({ token: data.token, user: data.user }, true);
            navigate('/rider/dashboard');
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Unable to login. Please try again.');
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
                                <h1 className="auth-heading">Rider Portal</h1>
                                <p className="auth-subtitle">Sign in to manage your deliveries</p>
                            </div>

                            {stateMessage && (
                                <div className="auth-alert auth-alert--success">{stateMessage}</div>
                            )}

                            {errorMessage && (
                                <div className="auth-alert auth-alert--error">{errorMessage}</div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group form-group--auth">
                                    <label htmlFor="rider-email" className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        id="rider-email"
                                        className="form-input form-input--premium"
                                        placeholder="rider@solestore.com"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group form-group--auth">
                                    <label htmlFor="rider-password" className="form-label">Password</label>
                                    <div className="password-field-wrap">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="rider-password"
                                            className="form-input form-input--premium form-input--with-toggle"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword((current) => !current)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            aria-pressed={showPassword}
                                        >
                                            {showPassword ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.8 2.92-4.94 5.3-6.32"></path>
                                                    <path d="M1 1l22 22"></path>
                                                    <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.66 0 1.28-.18 1.81-.48"></path>
                                                    <path d="M14.47 14.47 9.53 9.53"></path>
                                                    <path d="M20.58 15.58A12.2 12.2 0 0 0 23 12c-1.73-4.89-6-8-11-8-1.61 0-3.15.32-4.56.91"></path>
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn--primary btn--premium auth-submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Login to Rider Panel'}
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>New rider?</span>
                            </div>

                            <div className="auth-footer-section">
                                <Link to="/rider/register" className="auth-footer-inline-link">
                                    Create Rider Account
                                </Link>
                            </div>

                            <div className="auth-secondary-links">
                                <Link to="/login" className="auth-secondary-link">
                                    Back to User Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
