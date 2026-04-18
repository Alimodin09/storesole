import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';
import AuthImageCarousel from '../components/AuthImageCarousel.jsx';

export default function ResetPassword() {
	const { token = '' } = useParams();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [email, setEmail] = useState(searchParams.get('email') || '');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();
		setErrorMessage('');

		if (password !== confirmPassword) {
			setErrorMessage('Passwords do not match.');
			return;
		}

		setLoading(true);

		try {
			const { data } = await api.post('/auth/reset-password', {
				email,
				token,
				password,
				password_confirmation: confirmPassword,
			});

			navigate('/login', {
				state: {
					message: data.message || 'Password reset successful. You can now login.',
				},
			});
		} catch (error) {
			setErrorMessage(error?.response?.data?.message || 'Unable to reset password.');
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
								<h1 className="auth-heading">Reset Password</h1>
								<p className="auth-subtitle">Set a fresh password to securely restore your account access.</p>
							</div>

							{errorMessage && <div className="auth-alert auth-alert--error">{errorMessage}</div>}

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

								<div className="form-group form-group--auth">
									<label htmlFor="password" className="form-label">New Password</label>
									<input
										type="password"
										id="password"
										className="form-input form-input--premium"
										placeholder="Create your new password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										required
										minLength={6}
									/>
								</div>

								<div className="form-group form-group--auth">
									<label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
									<input
										type="password"
										id="confirmPassword"
										className="form-input form-input--premium"
										placeholder="Re-enter your new password"
										value={confirmPassword}
										onChange={(event) => setConfirmPassword(event.target.value)}
										required
										minLength={6}
									/>
								</div>

								<button type="submit" className="btn btn--primary btn--premium auth-submit" disabled={loading}>
									{loading ? 'Resetting Password...' : 'Reset Password'}
								</button>
							</form>

							<div className="auth-footer-section">
								<p className="auth-footer-text">Need to go back?</p>
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
