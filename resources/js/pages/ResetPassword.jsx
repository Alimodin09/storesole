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
						<div className="auth-brand">SoleStore</div>

						<div className="auth-header auth-header--left">
							<h1>Reset Password</h1>
							<p className="auth-subtitle">Set your new password to regain account access.</p>
						</div>

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
								<label htmlFor="password">New Password</label>
								<input
									type="password"
									id="password"
									placeholder="Enter new password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									required
									minLength={6}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="confirmPassword">Confirm New Password</label>
								<input
									type="password"
									id="confirmPassword"
									placeholder="Confirm new password"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									required
									minLength={6}
								/>
							</div>

							<button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
								{loading ? 'Resetting Password...' : 'Reset Password'}
							</button>
						</form>

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
