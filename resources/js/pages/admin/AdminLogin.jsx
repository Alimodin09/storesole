import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { setAuthUser } from '../../utils/auth.js';

// Update this path if the logo file location changes
const AUTH_LOGO_PATH = '/images/carousel/sole-logo.png';

export default function AdminLogin() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [isPageMounted, setIsPageMounted] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		// Trigger animation on mount
		setIsPageMounted(true);
	}, []);

const handleSubmit = async (e) => {
e.preventDefault();
setErrorMessage('');
setLoading(true);

try {
const { data } = await api.post('/auth/admin-login', { email, password });
setAuthUser({ token: data.token, user: data.user }, true);
navigate('/admin/dashboard');
} catch (error) {
setErrorMessage(error?.response?.data?.message || 'Unable to login as admin.');
} finally {
setLoading(false);
}
};

return (
<div className="page--auth page--auth-admin">
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
		<h1 className="auth-heading">Admin Portal</h1>
		<p className="auth-subtitle">Access Admin Dashboard</p>
	</div>

{errorMessage && (
	<div className="auth-alert auth-alert--error">{errorMessage}</div>
)}

<form onSubmit={handleSubmit} className="auth-form">
<div className="form-group form-group--auth">
<label htmlFor="email" className="form-label">Admin Email</label>
<input
type="email"
id="email"
className="form-input form-input--premium"
placeholder="admin@solestore.com"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
</div>

<div className="form-group form-group--auth">
<label htmlFor="password" className="form-label">Password</label>
<input
type="password"
id="password"
className="form-input form-input--premium"
placeholder="Enter your password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>
</div>

<button type="submit" className="btn btn--primary btn--premium auth-submit" disabled={loading}>
{loading ? 'Logging in...' : 'Login to Admin Panel'}
</button>
</form>

<div className="auth-divider">
<span>Not an admin?</span>
</div>

<div className="auth-footer-section">
	<Link to="/login" className="auth-footer-inline-link">
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
