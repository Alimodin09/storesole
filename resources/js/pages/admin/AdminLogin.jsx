import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { setAuthUser } from '../../utils/auth.js';

export default function AdminLogin() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState('');
const navigate = useNavigate();

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
<div className="page--auth">
<div className="auth-shell">
<div className="auth-card">
<div className="auth-header">
<h1>Admin Portal</h1>
<p className="auth-subtitle">Access Admin Dashboard</p>
</div>

{errorMessage && <p className="auth-error">{errorMessage}</p>}

<form onSubmit={handleSubmit} className="auth-form">
<div className="form-group">
<label htmlFor="email">Admin Email</label>
<input
type="email"
id="email"
placeholder="admin@solestore.com"
value={email}
onChange={(e) => setEmail(e.target.value)}
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
onChange={(e) => setPassword(e.target.value)}
required
/>
</div>

<button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
{loading ? 'Logging in...' : 'Login to Admin Panel'}
</button>
</form>

<div className="auth-divider">
<span>Not an admin?</span>
</div>

<Link to="/login" className="auth-footer-link">
Back to User Login
</Link>
</div>
</div>
</div>
);
}
