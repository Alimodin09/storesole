import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { clearAuthUser, updateAuthUserProfile } from '../utils/auth.js';
import {
	IconBasicInfo,
	IconSecurity,
	IconOrders,
	IconShopping,
	IconLogout,
	IconUpload,
	IconEyeOpen,
	IconEyeClosed,
	IconCheck,
	IconActive,
} from '../components/ProfileIcons.jsx';

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
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
				<div className="container profile-dashboard">
					<div className="profile-panel"><h2>Loading profile...</h2></div>
				</div>
			</section>
		);
	}

	return (
		<section className="page page--profile profile-dashboard-page">
			<div className="container profile-dashboard">
				{/* Page Header */}
				<div className="profile-dashboard__heading">
					<h1>My Account</h1>
					<p>Manage your profile, security settings, and account preferences</p>
				</div>

				{/* Alert Messages */}
				{errorMessage && <p className="profile-alert profile-alert--error">{errorMessage}</p>}
				{profileMessage && <p className="profile-alert profile-alert--success">{profileMessage}</p>}
				{passwordMessage && <p className="profile-alert profile-alert--success">{passwordMessage}</p>}

				{/* Main 2-Column Layout */}
				<div className="profile-dashboard__layout">
					{/* LEFT SIDEBAR - Profile Card */}
					<aside className="profile-panel profile-panel--summary">
						<div className="profile-avatar-wrap">
							{avatarUrl && !avatarLoadError ? (
								<img
									src={avatarUrl}
									alt={profile.name}
									className="profile-avatar"
									onError={() => {
										setAvatarLoadError(true);
									}}
								/>
							) : (
								<div className="profile-avatar profile-avatar--fallback">{avatarText}</div>
							)}
						</div>

						<div className="profile-info">
							<h2>{profile.name || 'SoleStore User'}</h2>
							<p>{profile.email}</p>
						</div>

						{/* Status Badges */}
						<div className="profile-summary-list">
							<div>
								<span>Member Status</span>
								<strong className="badge-status">
									<IconActive /> Active
								</strong>
							</div>
							<div>
								<span>Account Type</span>
								<strong>Customer</strong>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="profile-actions">
							<Link to="/orders" className="btn btn--primary profile-action-link">
								<IconOrders /> My Orders
							</Link>
							<Link to="/products" className="btn btn--ghost profile-action-link">
								<IconShopping /> Continue Shopping
							</Link>
							<button 
								type="button" 
								className="btn btn--danger profile-action-link" 
								onClick={handleLogout}
							>
								<IconLogout /> Logout
							</button>
						</div>
					</aside>

					{/* RIGHT SIDE - Content Forms */}
					<div className="profile-dashboard__content">
						{/* BASIC ACCOUNT INFO FORM */}
						<form className="profile-form-section" onSubmit={handleProfileSubmit}>
							<h2><IconBasicInfo /> Basic Account Info</h2>

							{/* Profile Picture Upload */}
							<div className="profile-form-group">
								<label>Profile Picture</label>
								<div className="profile-file-input-wrapper">
									<input 
										type="file" 
										id="profileImage" 
										accept="image/*" 
										onChange={handleProfileImageChange}
									/>
									<label htmlFor="profileImage" className="file-input-label">
										<IconUpload /> {profileImageFile ? 'Change Photo' : 'Upload Photo'}
									</label>
									{profileImageFile && (
										<div className="file-name-display">
											<IconCheck /> {profileImageFile.name}
										</div>
									)}
								</div>
							</div>

							{/* Full Name */}
							<div className="profile-form-grid">
								<div className="profile-form-group">
									<label htmlFor="name">Full Name</label>
									<input
										type="text"
										id="name"
										value={profile.name}
										onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
										placeholder="Enter your full name"
										required
									/>
								</div>

								{/* Email */}
								<div className="profile-form-group">
									<label htmlFor="email">Email Address</label>
									<input
										type="email"
										id="email"
										value={profile.email}
										onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
										placeholder="your.email@example.com"
										required
									/>
								</div>
							</div>

							{/* Save Button */}
							<div className="profile-form-actions">
								<button 
									type="submit" 
									className="btn btn--primary profile-btn" 
									disabled={savingProfile}
								>
									{savingProfile ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						</form>

						{/* SECURITY SETTINGS FORM */}
						<form className="profile-form-section" onSubmit={handlePasswordSubmit}>
							<h2><IconSecurity /> Security Settings</h2>

							{/* Current Password */}
							<div className="profile-form-grid">
								<div className="profile-form-group">
									<label htmlFor="currentPassword">Current Password</label>
									<div className="password-field-wrapper">
										<input
											type={showCurrentPassword ? 'text' : 'password'}
											id="currentPassword"
											value={passwordForm.current_password}
											onChange={(event) => setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))}
											placeholder="Enter current password"
											required
										/>
										<button
											type="button"
											className="password-toggle"
											onClick={() => setShowCurrentPassword(!showCurrentPassword)}
											title={showCurrentPassword ? 'Hide password' : 'Show password'}
										>
											{showCurrentPassword ? <IconEyeOpen /> : <IconEyeClosed />}
										</button>
									</div>
								</div>

								{/* New Password */}
								<div className="profile-form-group">
									<label htmlFor="newPassword">New Password</label>
									<div className="password-field-wrapper">
										<input
											type={showNewPassword ? 'text' : 'password'}
											id="newPassword"
											value={passwordForm.new_password}
											onChange={(event) => setPasswordForm((prev) => ({ ...prev, new_password: event.target.value }))}
											placeholder="Enter new password (min 6 chars)"
											required
											minLength={6}
										/>
										<button
											type="button"
											className="password-toggle"
											onClick={() => setShowNewPassword(!showNewPassword)}
											title={showNewPassword ? 'Hide password' : 'Show password'}
										>
											{showNewPassword ? <IconEyeOpen /> : <IconEyeClosed />}
										</button>
									</div>
								</div>
							</div>

							{/* Confirm Password (Full Width) */}
							<div className="profile-form-grid full-width">
								<div className="profile-form-group">
									<label htmlFor="confirmPassword">Confirm New Password</label>
									<div className="password-field-wrapper">
										<input
											type={showConfirmPassword ? 'text' : 'password'}
											id="confirmPassword"
											value={passwordForm.new_password_confirmation}
											onChange={(event) => setPasswordForm((prev) => ({ ...prev, new_password_confirmation: event.target.value }))}
											placeholder="Re-enter new password"
											required
											minLength={6}
										/>
										<button
											type="button"
											className="password-toggle"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											title={showConfirmPassword ? 'Hide password' : 'Show password'}
										>
											{showConfirmPassword ? <IconEyeOpen /> : <IconEyeClosed />}
										</button>
									</div>
								</div>
							</div>

							{/* Update Password Button */}
							<div className="profile-form-actions">
								<button 
									type="submit" 
									className="btn btn--primary profile-btn" 
									disabled={savingPassword}
								>
									{savingPassword ? 'Updating...' : 'Update Password'}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}
