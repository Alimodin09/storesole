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
						<div className="auth-brand">SoleStore</div>

						<div className="auth-header auth-header--left">
							<h1>Forgot Password</h1>
							<p className="auth-subtitle">Enter your account email to generate a reset token.</p>
						</div>

						{errorMessage && <p className="auth-error">{errorMessage}</p>}
						{successMessage && <div className="alert alert-success">{successMessage}</div>}

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

							<button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
								{loading ? 'Generating Token...' : 'Generate Reset Token'}
							</button>
						</form>

						{resetToken && (
							<div className="auth-reset-token-box">
								<p><strong>Reset Token:</strong> {resetToken}</p>
								<Link to={`/reset-password/${encodeURIComponent(resetToken)}?email=${encodeURIComponent(email)}`} className="auth-footer-link">
									Continue to Reset Password
								</Link>
							</div>
						)}

						<div className="auth-footer-links">
							<Link to="/login" className="auth-footer-link">Back to Login</Link>
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
