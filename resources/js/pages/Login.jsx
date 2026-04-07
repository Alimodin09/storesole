import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { setAuthUser } from '../utils/auth.js';
import AuthImageCarousel from '../components/AuthImageCarousel.jsx';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });
            setAuthUser({ token: data.token, user: data.user }, true);
            navigate('/');
        } catch (error) {
            if (error?.response?.status === 403) {
                setErrorMessage('This account is for admin access. Use the Admin Login page instead.');
            } else {
                setErrorMessage(error?.response?.data?.message || 'Unable to login. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page--auth page--auth-customer">
            <div className="auth-shell">
                <div className="auth-card auth-card--split">
                    <div className="auth-card__form-pane">
                        <div className="auth-brand">SoleStore</div>

                        <div className="auth-header auth-header--left">
                            <h1>Welcome Back</h1>
                            <p className="auth-subtitle">Login to your SoleStore account</p>
                        </div>

                        {location.state?.message && <div className="alert alert-success">{location.state.message}</div>}
                        {errorMessage && <p className="auth-error">{errorMessage}</p>}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />
                                <div className="auth-inline-links">
                                    <Link to="/forgot-password" className="auth-forgot-link">
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>

                            <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="auth-footer-links">
                            <Link to="/signup" className="auth-footer-link">
                                Create an Account
                            </Link>
                            <Link to="/admin/login" className="auth-footer-link auth-footer-link--muted">
                                Admin Login
                            </Link>
                        </div>
                    </div>

                    <div className="auth-card__visual-pane">
                        <AuthImageCarousel />
                    </div>
                </div>
            </div>
        </div>
    );
}
