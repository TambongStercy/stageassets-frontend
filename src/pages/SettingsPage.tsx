import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Lock,
  CreditCard,
  AlertTriangle,
  Upload,
  Trash2,
  Save,
  ArrowLeft,
  ScrollText,
} from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ImageUpload } from '../components/ImageUpload';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { NotificationModal } from '../components/NotificationModal';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { usersService } from '../services/users.service';
import { subscriptionPlansService } from '../services/subscription-plans.service';
import { useAuth } from '../hooks/useAuth';
import { getFileUrl } from '../lib/file-url';

type Tab = 'profile' | 'subscription' | 'security' | 'account';

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning';
    message: string;
    title?: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => usersService.getProfile(),
    onSuccess: (data) => {
      setProfileData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
      });
    },
  });

  // Fetch subscription history
  const { data: subscriptionHistory } = useQuery({
    queryKey: ['subscription-history', profile?.id],
    queryFn: () => usersService.getSubscriptionHistory(profile!.id),
    enabled: !!profile?.id,
  });

  // Fetch current plan details
  const { data: currentPlan } = useQuery({
    queryKey: ['subscription-plan', profile?.currentPlanId],
    queryFn: () => subscriptionPlansService.getPlan(profile!.currentPlanId!),
    enabled: !!profile?.currentPlanId,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof profileData) => usersService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Your profile has been updated successfully!',
      });
    },
    onError: (error: any) => {
      setNotification({
        isOpen: true,
        type: 'error',
        message: error.response?.data?.message || 'Failed to update profile',
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      usersService.changePassword(data),
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Your password has been changed successfully!',
      });
    },
    onError: (error: any) => {
      setNotification({
        isOpen: true,
        type: 'error',
        message: error.response?.data?.message || 'Failed to change password',
      });
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => usersService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => usersService.deleteAccount(),
    onSuccess: () => {
      logout();
      navigate('/');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({
        isOpen: true,
        type: 'error',
        message: 'The passwords you entered do not match. Please try again.',
      });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setNotification({
        isOpen: true,
        type: 'warning',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleAvatarSelect = (file: File) => {
    uploadAvatarMutation.mutate(file);
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const formatPrice = (cents: number | null) => {
    if (cents === null || cents === 0) return 'Free';
    const dollars = cents / 100;
    return dollars.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  if (profileLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-24 shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Settings Menu</h3>
            </div>
            <nav className="p-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1 ${
                  activeTab === 'profile'
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'profile' ? 'bg-emerald-100' : 'bg-gray-100'
                }`}>
                  <User className="w-4 h-4" />
                </div>
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1 ${
                  activeTab === 'subscription'
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'subscription' ? 'bg-emerald-100' : 'bg-gray-100'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <span>Subscription</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1 ${
                  activeTab === 'security'
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'security' ? 'bg-emerald-100' : 'bg-gray-100'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'account'
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'account' ? 'bg-red-50' : 'bg-gray-100'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${activeTab === 'account' ? 'text-red-600' : ''}`} />
                </div>
                <span>Account</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  <p className="text-sm text-gray-600 mt-1">Update your personal details and profile picture</p>
                </div>
                <div className="p-6">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-4">
                        {profile?.avatarUrl ? (
                          <img
                            src={getFileUrl(profile.avatarUrl)!}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-gray-200">
                            <User className="w-10 h-10 text-emerald-700" />
                          </div>
                        )}
                        <ImageUpload
                          label="Change Avatar"
                          onFileSelect={handleAvatarSelect}
                          maxSizeMB={10}
                        />
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, firstName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, lastName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {!profile?.isEmailVerified && (
                        <p className="mt-1 text-sm text-yellow-600">
                          Email not verified. Check your inbox for verification link.
                        </p>
                      )}
                    </div>

                    {/* Auth Provider */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Login Method
                      </label>
                      <div className="text-sm text-gray-600">
                        {profile?.authProvider === 'google' ? 'Google OAuth' : 'Email & Password'}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </div>
              </div>
            </>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <>
              {/* Current Plan */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
                  <p className="text-sm text-gray-600 mt-1">Your active subscription plan and limits</p>
                </div>
                <div className="p-6">
                  {currentPlan ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {currentPlan.displayName}
                          </h3>
                          <p className="text-sm text-gray-600">{currentPlan.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(currentPlan.priceMonthly)}
                          </div>
                          {currentPlan.priceMonthly > 0 && (
                            <div className="text-sm text-gray-500">/month</div>
                          )}
                        </div>
                      </div>

                      {/* Plan Limits */}
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Your Limits</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Active Events:</span>
                            <span className="font-medium text-gray-900">
                              {currentPlan.maxActiveEvents === -1
                                ? 'Unlimited'
                                : currentPlan.maxActiveEvents}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Speakers per Event:</span>
                            <span className="font-medium text-gray-900">
                              {currentPlan.maxSpeakersPerEvent === -1
                                ? 'Unlimited'
                                : currentPlan.maxSpeakersPerEvent}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Features</h4>
                        <ul className="space-y-2">
                          {currentPlan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        onClick={() => navigate('/pricing')}
                        variant="secondary"
                        className="w-full shadow-sm"
                      >
                        View All Plans
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">You don't have an active subscription</p>
                      <Button
                        onClick={() => navigate('/pricing')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        View Plans
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription History */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Subscription History</h2>
                  <p className="text-sm text-gray-600 mt-1">View your past subscription transactions</p>
                </div>
                <div className="p-6">
                  {subscriptionHistory && subscriptionHistory.length > 0 ? (
                    <div className="space-y-3">
                      {subscriptionHistory.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {sub.plan?.displayName || 'Unknown Plan'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {format(new Date(sub.startDate), 'MMM d, yyyy')} -{' '}
                              {sub.endDate
                                ? format(new Date(sub.endDate), 'MMM d, yyyy')
                                : 'Present'}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {sub.amountPaid && (
                              <div className="text-sm font-medium text-gray-900">
                                {formatPrice(sub.amountPaid)}
                              </div>
                            )}
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                sub.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : sub.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No subscription history available</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your password and security preferences</p>
              </div>
              <div className="p-6">
                {profile?.authProvider === 'google' ? (
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">
                      You're signed in with Google. Password changes are managed through your
                      Google account.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">At least 8 characters</p>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-white border-2 border-red-200 rounded-xl shadow-sm">
              <div className="p-6 border-b border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
                </div>
                <p className="text-sm text-red-700 mt-1">Irreversible actions that permanently affect your account</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Deleting your account will permanently remove all your data, including events,
                    speakers, submissions, and subscription history. This action cannot be undone.
                  </p>

                  <Button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        message="Are you sure you want to delete your account? This will permanently remove all your data and cannot be undone. You will be immediately logged out."
        confirmText="Delete My Account"
        isDangerous
        isLoading={deleteAccountMutation.isPending}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </DashboardLayout>
  );
}
