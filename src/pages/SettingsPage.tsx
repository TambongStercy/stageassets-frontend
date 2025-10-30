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
  CheckCircle,
  Shield,
  Bell,
} from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ImageUpload } from '../components/ImageUpload';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { NotificationModal } from '../components/NotificationModal';
import { Avatar } from '../components/Avatar';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { usersService } from '../services/users.service';
import { subscriptionPlansService } from '../services/subscription-plans.service';
import { useAuth } from '../hooks/useAuth';

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
          className="group flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 mb-6 transition-all"
        >
          <div className="w-6 h-6 rounded-md bg-gray-100 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your profile, security, and subscription preferences</p>
          </div>
          {profile?.isEmailVerified && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-full shadow-sm">
              <CheckCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-700">Verified</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden sticky top-24 shadow-lg">
            <nav className="p-3">
              <button
                onClick={() => setActiveTab('profile')}
                className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all mb-2 ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'profile' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-emerald-50'
                }`}>
                  <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-gray-600 group-hover:text-emerald-600'}`} />
                </div>
                <span className="flex-1 text-left">Profile</span>
                {activeTab === 'profile' && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all mb-2 ${
                  activeTab === 'subscription'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'subscription' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-emerald-50'
                }`}>
                  <CreditCard className={`w-4 h-4 ${activeTab === 'subscription' ? 'text-white' : 'text-gray-600 group-hover:text-emerald-600'}`} />
                </div>
                <span className="flex-1 text-left">Subscription</span>
                {activeTab === 'subscription' && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all mb-2 ${
                  activeTab === 'security'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'security' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-emerald-50'
                }`}>
                  <Shield className={`w-4 h-4 ${activeTab === 'security' ? 'text-white' : 'text-gray-600 group-hover:text-emerald-600'}`} />
                </div>
                <span className="flex-1 text-left">Security</span>
                {activeTab === 'security' && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'account'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                    : 'text-gray-700 hover:bg-red-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'account' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-red-50'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${activeTab === 'account' ? 'text-white' : 'text-gray-600 group-hover:text-red-600'}`} />
                </div>
                <span className="flex-1 text-left">Account</span>
                {activeTab === 'account' && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-lg overflow-hidden">
                <div className="px-8 py-6 border-b-2 border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                      <p className="text-sm text-gray-600 mt-0.5">Update your personal details and profile picture</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-gray-200 rounded-2xl p-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Profile Picture
                      </label>
                      <div className="flex items-start gap-6">
                        <div className="relative">
                          <Avatar
                            avatarUrl={profile?.avatarUrl}
                            firstName={profile?.firstName}
                            lastName={profile?.lastName}
                            size="lg"
                            className="ring-2 ring-gray-200 shadow-md"
                          />
                          {uploadAvatarMutation.isPending && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 mb-2">
                            Update your profile photo
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Choose a photo that clearly shows your face. Recommended size: 400x400px
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <ImageUpload
                              label="Upload New Photo"
                              onFileSelect={handleAvatarSelect}
                              maxSizeMB={10}
                            />
                            {profile?.avatarUrl && !profile?.googleId && (
                              <button
                                type="button"
                                onClick={() => {
                                  // TODO: Implement remove avatar functionality
                                  console.log('Remove avatar');
                                }}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-lg transition-all"
                              >
                                Remove Photo
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-3">
                            Supported formats: JPG, PNG • Max file size: 10MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-semibold text-gray-700 mb-2"
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
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-semibold text-gray-700 mb-2"
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
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
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
                        disabled={profile?.googleId != null}
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                          profile?.googleId ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''
                        }`}
                        placeholder="your@email.com"
                      />
                      {!profile?.isEmailVerified && !profile?.googleId && (
                        <p className="mt-1 text-sm text-yellow-600">
                          Email not verified. Check your inbox for verification link.
                        </p>
                      )}
                      {profile?.googleId && (
                        <p className="mt-1 text-sm text-gray-500">
                          Email cannot be changed for Google accounts
                        </p>
                      )}
                    </div>

                    {/* Auth Provider */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Authentication Method
                      </label>
                      {profile?.googleId ? (
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl border-2 border-gray-100 flex items-center justify-center shadow-sm">
                              <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-base font-semibold text-gray-900">Google Account</h4>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                                  Active
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Secured with Google OAuth 2.0
                              </p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border-2 border-emerald-100 flex items-center justify-center">
                              <Lock className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-base font-semibold text-gray-900">Email & Password</h4>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                                  Active
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Traditional email authentication
                              </p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t-2 border-gray-100">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/30 px-6 py-3 text-base font-semibold"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        {updateProfileMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                      </Button>
                    </div>
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
                {profile?.googleId ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Account Security</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Your account is secured by Google. Password and security settings are managed through your Google account.
                    </p>
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700 shadow-sm"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Manage Google Security</span>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">Password Security</h4>
                          <p className="text-sm text-blue-700">
                            For security reasons, passwords cannot be changed directly. Use the password reset flow to receive a secure link via email.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lock className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">Change Your Password</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Click the button below to receive a password reset link at <strong>{profile?.email}</strong>
                          </p>
                          <Button
                            onClick={() => navigate('/forgot-password')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          >
                            Reset Password via Email
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">Security Best Practices</h4>
                          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                            <li>Use a strong, unique password (at least 8 characters)</li>
                            <li>Never share your password with anyone</li>
                            <li>Enable email verification if you haven't already</li>
                            <li>Log out from shared or public devices</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
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
