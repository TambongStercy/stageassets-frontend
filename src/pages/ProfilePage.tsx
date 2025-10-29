import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/ui';
import { ImageUpload } from '../components/ImageUpload';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useAuth } from '../hooks/useAuth';
import { usersService } from '../services/users.service';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'password' | 'danger'>('general');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // General settings
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setGeneralSuccess(true);
      setGeneralError(null);
      setTimeout(() => setGeneralSuccess(false), 3000);
    },
    onError: (err: any) => {
      setGeneralError(err.response?.data?.message || 'Failed to update profile');
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: usersService.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setAvatarFile(null);
    },
    onError: (err: any) => {
      setGeneralError(err.response?.data?.message || 'Failed to upload avatar');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: usersService.changePassword,
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (err: any) => {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: usersService.deleteAccount,
    onSuccess: () => {
      logout();
      navigate('/');
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    updateProfileMutation.mutate({ firstName, lastName, email });
  };

  const handleAvatarUpload = () => {
    if (avatarFile) {
      uploadAvatarMutation.mutate(avatarFile);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
    setIsDeleteModalOpen(false);
  };

  const isGoogleUser = user?.authProvider === 'google';

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              General
            </button>
            {!isGoogleUser && (
              <button
                onClick={() => setActiveTab('password')}
                className={`pb-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'border-emerald-700 text-emerald-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Password
              </button>
            )}
            <button
              onClick={() => setActiveTab('danger')}
              className={`pb-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'danger'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Danger Zone
            </button>
          </nav>
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {generalSuccess && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-700">Profile updated successfully</p>
              </div>
            )}

            {generalError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{generalError}</p>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <ImageUpload
                    label="Avatar"
                    onFileSelect={setAvatarFile}
                    currentImageUrl={user?.avatarUrl}
                    maxSizeMB={10}
                  />
                  {avatarFile && (
                    <Button
                      type="button"
                      onClick={handleAvatarUpload}
                      disabled={uploadAvatarMutation.isPending}
                      variant="secondary"
                    >
                      {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload Avatar'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Changing your email will require re-verification
                </p>
              </div>

              {isGoogleUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700">
                    You're signed in with Google. Some settings may be managed through your Google account.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && !isGoogleUser && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

            {passwordSuccess && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-700">Password changed successfully</p>
              </div>
            )}

            {passwordError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{passwordError}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  minLength={8}
                />
                <p className="mt-1 text-xs text-gray-500">At least 8 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="bg-white border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Account</h3>
            <p className="text-gray-700 mb-4">
              Once you delete your account, there is no going back. All your events, speakers, and
              submissions will be permanently deleted.
            </p>
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={deleteAccountMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Account
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        message="Are you sure you want to delete your account? This action cannot be undone. All your events, speakers, submissions, and data will be permanently deleted."
        confirmText="Delete Account"
        isDangerous
        isLoading={deleteAccountMutation.isPending}
      />
    </DashboardLayout>
  );
}
