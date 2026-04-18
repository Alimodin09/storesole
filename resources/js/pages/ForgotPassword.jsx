import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import AuthImageCarousel from '../components/AuthImageCarousel.jsx';

export default function ForgotPassword() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [resetToken, setResetToken] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setErrorMessage('');
		setSuccessMessage('');
		setResetToken('');

		try {
			const { data } = await api.post('/auth/forgot-password', { email });
			setSuccessMessage(data.message || 'Reset token generated successfully.');
			setResetToken(data.reset_token || '');
		} catch (error) {
			setErrorMessage(error?.response?.data?.message || 'Unable to process forgot password request.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="page--auth page--auth-customer">
			<div className="auth-shell">
				<div className="auth-card auth-card--split">
					<div className="auth-card__form-pane">
						<div className="auth-form-container">
							<div className="auth-brand-row">
								<Link to="/" className="auth-brand-link" aria-label="Back to Home">
									<span className="auth-brand-icon" aria-hidden="true">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M3 14.5c2.3-.4 4.9-.6 6.8-.5 2.1.1 4.6.8 7.2 2 1.6.7 3.2.8 4 .8v2.6H3z"></path>
											<path d="M8.2 11.2 12 8.1a2.6 2.6 0 0 1 3 0l1.8 1.4"></path>
										</svg>
									</span>
									<span className="auth-brand-text">SoleStore</span>
								</Link>
								<div className="auth-brand-links">
									<Link to="/login">Sign In</Link>
									<Link to="/">Back to Home</Link>
								</div>
							</div>

							<div className="auth-header auth-header--premium">
								<h1 className="auth-heading">Forgot Password</h1>
								<p className="auth-subtitle">Enter your email and we will prepare your password reset token.</p>
							</div>

							{errorMessage && <div className="auth-alert auth-alert--error">{errorMessage}</div>}
							{successMessage && <div className="auth-alert auth-alert--success">{successMessage}</div>}

							<form onSubmit={handleSubmit} className="auth-form">
								<div className="form-group form-group--auth">
									<label htmlFor="email" className="form-label">Email Address</label>
									<input
										type="email"
										id="email"
										className="form-input form-input--premium"
										placeholder="your@email.com"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										required
									/>
								</div>

								<button type="submit" className="btn btn--primary btn--premium auth-submit" disabled={loading}>
									{loading ? 'Generating Token...' : 'Generate Reset Token'}
								</button>
							</form>

							{resetToken && (
								<div className="auth-reset-token-box">
									<p><strong>Reset Token:</strong> {resetToken}</p>
									<Link
										to={`/reset-password/${encodeURIComponent(resetToken)}?email=${encodeURIComponent(email)}`}
										className="auth-footer-action auth-footer-action--primary"
									>
										Continue to Reset Password
									</Link>
								</div>
							)}

							<div className="auth-footer-section">
								<p className="auth-footer-text">Remembered your password?</p>
								<Link to="/login" className="auth-footer-action auth-footer-action--primary">Back to Sign In</Link>
							</div>
						</div>
					</div>

					<div className="auth-card__visual-pane">
						<AuthImageCarousel type="login" />
					</div>
				</div>
			</div>
		</div>
	);
}
