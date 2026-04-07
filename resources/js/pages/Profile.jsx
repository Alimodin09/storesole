import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { clearAuthUser, updateAuthUserProfile } from '../utils/auth.js';

export default function Profile() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [savingProfile, setSavingProfile] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [profileMessage, setProfileMessage] = useState('');
	const [passwordMessage, setPasswordMessage] = useState('');
	const [profile, setProfile] = useState({
		name: '',
		email: '',
		profile_image_url: '',
	});
	const [profileImageFile, setProfileImageFile] = useState(null);
	const [imagePreviewUrl, setImagePreviewUrl] = useState('');
	const [avatarLoadError, setAvatarLoadError] = useState(false);
	const [passwordForm, setPasswordForm] = useState({
		current_password: '',
		new_password: '',
		new_password_confirmation: '',
	});

	useEffect(() => {
		let active = true;

		const fetchProfile = async () => {
			setLoading(true);
			setErrorMessage('');

			try {
				const { data } = await api.get('/profile');

				if (!active) {
					return;
				}

				setProfile({
					name: data?.user?.name || '',
					email: data?.user?.email || '',
					profile_image_url: data?.user?.profile_image_url || '',
				});
			} catch (error) {
				if (active) {
					setErrorMessage(error?.response?.data?.message || 'Unable to load profile.');
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		fetchProfile();

		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		return () => {
			if (imagePreviewUrl) {
				URL.revokeObjectURL(imagePreviewUrl);
			}
		};
	}, [imagePreviewUrl]);

	const avatarText = useMemo(() => {
		const name = profile.name?.trim();
		if (!name) {
			return 'U';
		}
		return name.charAt(0).toUpperCase();
	}, [profile.name]);

	const avatarUrl = imagePreviewUrl || profile.profile_image_url;

	const handleProfileImageChange = (event) => {
		const file = event.target.files?.[0] || null;
		setAvatarLoadError(false);
		setProfileImageFile(file);
		setProfileMessage('');

		if (!file) {
			if (imagePreviewUrl) {
				URL.revokeObjectURL(imagePreviewUrl);
			}
			setImagePreviewUrl('');
			return;
		}

		if (imagePreviewUrl) {
			URL.revokeObjectURL(imagePreviewUrl);
		}

		const objectUrl = URL.createObjectURL(file);
		setImagePreviewUrl(objectUrl);
	};

	const handleProfileSubmit = async (event) => {
		event.preventDefault();
		setSavingProfile(true);
		setErrorMessage('');
		setProfileMessage('');

		try {
			const formData = new FormData();
			formData.append('name', profile.name);
			formData.append('email', profile.email);

			if (profileImageFile) {
				formData.append('profile_image', profileImageFile);
			}

			const { data } = await api.post('/profile', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			const updatedUser = data?.user || {};

			setProfile({
				name: updatedUser.name || '',
				email: updatedUser.email || '',
				profile_image_url: updatedUser.profile_image_url || '',
			});
			setProfileImageFile(null);
			setImagePreviewUrl('');
			setAvatarLoadError(false);
			updateAuthUserProfile(updatedUser);
			setProfileMessage(data?.message || 'Profile updated successfully.');
		} catch (error) {
			setErrorMessage(error?.response?.data?.message || 'Unable to update profile.');
		} finally {
			setSavingProfile(false);
		}
	};

	const handlePasswordSubmit = async (event) => {
		event.preventDefault();
		setSavingPassword(true);
		setErrorMessage('');
		setPasswordMessage('');

		if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
			setErrorMessage('New passwords do not match.');
			setSavingPassword(false);
			return;
		}

		try {
			const { data } = await api.put('/profile/password', passwordForm);
			setPasswordMessage(data?.message || 'Password updated successfully.');
			setPasswordForm({
				current_password: '',
				new_password: '',
				new_password_confirmation: '',
			});
		} catch (error) {
			setErrorMessage(error?.response?.data?.message || 'Unable to update password.');
		} finally {
			setSavingPassword(false);
		}
	};

	const handleLogout = () => {
		clearAuthUser();
		navigate('/login');
	};

	if (loading) {
		return (
			<section className="page page--profile">
				<div className="container profile-shell">
					<div className="profile-card profile-card--single">
						<h2>Loading profile...</h2>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="page page--profile">
			<div className="container profile-shell">
				<div className="profile-page-heading">
					<h1>My Profile</h1>
					<p>Manage your account information, profile picture, and security settings.</p>
				</div>

				<div className="profile-card profile-card--header">
					<div className="profile-avatar-wrap">
						{avatarUrl && !avatarLoadError ? (
							<img
								src={avatarUrl}
								alt={profile.name}
								className="profile-avatar"
								onError={(event) => {
									setAvatarLoadError(true);
								}}
							/>
						) : (
							<div className="profile-avatar profile-avatar--fallback">{avatarText}</div>
						)}
					</div>
					<div>
						<h2>{profile.name || 'SoleStore User'}</h2>
						<p>{profile.email}</p>
					</div>
				</div>

				{errorMessage && <p className="profile-alert profile-alert--error">{errorMessage}</p>}
				{profileMessage && <p className="profile-alert profile-alert--success">{profileMessage}</p>}
				{passwordMessage && <p className="profile-alert profile-alert--success">{passwordMessage}</p>}

				<div className="profile-grid">
					<form className="profile-card" onSubmit={handleProfileSubmit}>
						<h2>Basic Account Info</h2>
						<div className="profile-form-group">
							<label htmlFor="profileImage">Profile Picture</label>
							<input
								type="file"
								id="profileImage"
								accept="image/*"
								onChange={handleProfileImageChange}
							/>
						</div>
						<div className="profile-form-group">
							<label htmlFor="name">Full Name</label>
							<input
								type="text"
								id="name"
								value={profile.name}
								onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
								required
							/>
						</div>
						<div className="profile-form-group">
							<label htmlFor="email">Email</label>
							<input
								type="email"
								id="email"
								value={profile.email}
								onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
								required
							/>
						</div>
						<button type="submit" className="btn btn--primary profile-btn" disabled={savingProfile}>
							{savingProfile ? 'Saving...' : 'Save Changes'}
						</button>
					</form>

					<form className="profile-card" onSubmit={handlePasswordSubmit}>
						<h2>Change Password</h2>
						<div className="profile-form-group">
							<label htmlFor="currentPassword">Current Password</label>
							<input
								type="password"
								id="currentPassword"
								value={passwordForm.current_password}
								onChange={(event) => setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))}
								required
							/>
						</div>
						<div className="profile-form-group">
							<label htmlFor="newPassword">New Password</label>
							<input
								type="password"
								id="newPassword"
								value={passwordForm.new_password}
								onChange={(event) => setPasswordForm((prev) => ({ ...prev, new_password: event.target.value }))}
								required
								minLength={6}
							/>
						</div>
						<div className="profile-form-group">
							<label htmlFor="confirmPassword">Confirm New Password</label>
							<input
								type="password"
								id="confirmPassword"
								value={passwordForm.new_password_confirmation}
								onChange={(event) => setPasswordForm((prev) => ({ ...prev, new_password_confirmation: event.target.value }))}
								required
								minLength={6}
							/>
						</div>
						<button type="submit" className="btn btn--primary profile-btn" disabled={savingPassword}>
							{savingPassword ? 'Updating...' : 'Update Password'}
						</button>
					</form>

					<div className="profile-card profile-card--actions">
						<h2>Quick Actions</h2>
						<div className="profile-actions">
							<Link to="/orders" className="btn btn--primary profile-action-link">My Orders</Link>
							<Link to="/products" className="btn btn--ghost profile-action-link">Continue Shopping</Link>
							<button type="button" className="btn btn--ghost profile-action-link" onClick={handleLogout}>Logout</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
