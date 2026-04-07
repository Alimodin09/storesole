import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import AuthImageCarousel from '../components/AuthImageCarousel.jsx';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', {
                name,
                email,
                password,
                password_confirmation: confirmPassword,
            });

            navigate('/login', {
                state: {
                    message: 'Account created successfully. You can now log in.',
                },
            });
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Unable to create account.');
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
                            <h1>Create Account</h1>
                            <p className="auth-subtitle">Create your SoleStore account and start shopping</p>
                        </div>

                        {errorMessage && <p className="auth-error">{errorMessage}</p>}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                />
                            </div>

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
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="auth-footer-links">
                            <p className="auth-helper-text">Already have an account?</p>
                            <Link to="/login" className="auth-footer-link">
                                Sign in
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
