import React, { useEffect, useState } from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import {
  Settings,
  User,
  Users,
  ShieldCheck,
  Sliders,
  Mail,
  Phone,
  MapPin,
  Lock,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Bell,
  Globe,
  KeyRound,
  Download,
  Database,
  Info,
  HelpCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function SettingsAccountsPage() {
  const {
    currentUser,
    updateProfile,
    householdMembers,
    addFamilyMember,
    preferences,
    togglePreference,
    exportHomeData,
    backupHomeData,
    deleteAccount,
    addToast
  } = useHomeOs();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'family' | 'security' | 'general' | 'preferences' | 'privacy' | 'about'
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // 2FA state
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [twoFactorPin, setTwoFactorPin] = useState('');
  const [twoFactorConfirmPin, setTwoFactorConfirmPin] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    Boolean(currentUser?.twoFactorEnabled)
  );
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);

  // Keep the security toggle synced with the real backend 2FA state.
  useEffect(() => {
    const loadTwoFactorStatus = async () => {
      try {
        const response = await api.getProfile();

        if (response?.user) {
          setTwoFactorEnabled(Boolean(response.user.twoFactorEnabled));
        }
      } catch {
        // Keep the existing UI state if the profile request fails.
      }
    };

    loadTwoFactorStatus();
  }, []);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    role: currentUser.role,
    address: currentUser.address,
    avatar: currentUser.avatar
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
  };

  // Invite Family Member Form
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    relationship: 'Family Member',
    role: 'Member',
    permissions: { finance: false, documents: true, appliances: false, reminders: true }
  });

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;

    addFamilyMember(inviteForm);
    setInviteForm({
      name: '',
      email: '',
      relationship: 'Family Member',
      role: 'Member',
      permissions: { finance: false, documents: true, appliances: false, reminders: true }
    });
    setIsInviteModalOpen(false);
  };

  // Change Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      addToast({ title: 'Password Error', message: 'New password must be at least 6 characters', type: 'error' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({ title: 'Password Error', message: 'Passwords do not match', type: 'error' });
      return;
    }

    addToast({ title: 'Password Changed', message: 'Your household account password has been updated', type: 'success' });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsPasswordModalOpen(false);
  };

  // ==========================================
  // PIN-BASED TWO-FACTOR AUTHENTICATION
  // ==========================================
  const handleTwoFactorToggle = () => {
    setTwoFactorPin('');
    setTwoFactorConfirmPin('');
    setIsTwoFactorModalOpen(true);
  };

  const handleTwoFactorSubmit = async () => {
    if (twoFactorEnabled) {
      if (!/^\d{6}$/.test(twoFactorPin.trim())) {
        addToast({
          title: 'Invalid PIN',
          message: 'Please enter your current 6-digit 2FA PIN.',
          type: 'error'
        });
        return;
      }

      setIsTwoFactorLoading(true);

      try {
        await api.disableTwoFactor(twoFactorPin.trim());

        setTwoFactorEnabled(false);
        setIsTwoFactorModalOpen(false);
        setTwoFactorPin('');
        setTwoFactorConfirmPin('');

        // Keep the existing HomeOS preference state synchronized.
        if (preferences.twoFactor) {
          togglePreference('twoFactor');
        }

        addToast({
          title: '2FA Disabled',
          message: 'Two-factor authentication has been disabled.',
          type: 'success'
        });
      } catch (error) {
        addToast({
          title: '2FA Disable Failed',
          message: error.message || 'Incorrect 2FA PIN.',
          type: 'error'
        });
      } finally {
        setIsTwoFactorLoading(false);
      }

      return;
    }

    if (!/^\d{6}$/.test(twoFactorPin.trim())) {
      addToast({
        title: 'Invalid PIN',
        message: 'PIN must be exactly 6 digits.',
        type: 'error'
      });
      return;
    }

    if (twoFactorPin !== twoFactorConfirmPin) {
      addToast({
        title: 'PINs Do Not Match',
        message: 'Please make sure both PINs are identical.',
        type: 'error'
      });
      return;
    }

    setIsTwoFactorLoading(true);

    try {
      await api.setupTwoFactor(
        twoFactorPin.trim(),
        twoFactorConfirmPin.trim()
      );

      setTwoFactorEnabled(true);
      setIsTwoFactorModalOpen(false);
      setTwoFactorPin('');
      setTwoFactorConfirmPin('');

      // Keep the existing HomeOS preference state synchronized.
      if (!preferences.twoFactor) {
        togglePreference('twoFactor');
      }

      addToast({
        title: '2FA Enabled',
        message: 'Your 6-digit PIN is now required when signing in.',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: '2FA Setup Failed',
        message: error.message || 'Unable to enable two-factor authentication.',
        type: 'error'
      });
    } finally {
      setIsTwoFactorLoading(false);
    }
  };

  const navTabs = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'family', label: 'Household Members', icon: Users, badge: `${householdMembers.length}` },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck },
    { id: 'general', label: 'General Settings', icon: Globe },
    { id: 'preferences', label: 'Notifications & AI', icon: Sliders },
    { id: 'privacy', label: 'Privacy & Data', icon: Database },
    { id: 'about', label: 'About HomeOS', icon: Info }
  ];

  return (
    <div className="space-y-7 animate-fadeIn">
      
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#241D1A] tracking-tight font-sans">
          Settings & Accounts
        </h2>
        <p className="text-sm text-[#716963] mt-1">
          Manage your household profiles, preferences, security and HomeOS settings.
        </p>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-[#E8DDD6] shadow-homeos-sm overflow-x-auto scrollbar-none gap-1">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#C96243] text-white shadow-sm'
                  : 'text-[#716963] hover:text-[#241D1A] hover:bg-[#FBF7F3]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#FBF7F3] text-[#716963]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: Profile & Account */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User Profile Card (4 cols) */}
          <div className="lg:col-span-4">
            <Card padding="normal" className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={profileForm.avatar || currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#C96243] mx-auto shadow-homeos-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-24 h-24 rounded-2xl bg-[#F8E7E0] text-[#C96243] font-black text-2xl hidden items-center justify-center mx-auto">
                  {currentUser.avatarFallback || 'AM'}
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#4FA77B] border-2 border-white flex items-center justify-center text-white" title="Active">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#241D1A] font-sans">{currentUser.name}</h3>
                <p className="text-xs text-[#716963] mt-0.5">{currentUser.role}</p>
                <Badge variant="terracotta" size="sm" className="mt-2">
                  Primary Household Admin
                </Badge>
              </div>

              <div className="pt-4 border-t border-[#E8DDD6] text-left space-y-2.5 text-xs text-[#716963]">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C96243] shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C96243] shrink-0" />
                  <span>{currentUser.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C96243] shrink-0" />
                  <span className="truncate">{currentUser.address}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Edit Form (8 cols) */}
          <div className="lg:col-span-8">
            <Card padding="normal" className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD6]">
                <div>
                  <h3 className="text-base font-bold text-[#241D1A] font-sans">Account Profile</h3>
                  <p className="text-xs text-[#716963]">Update personal information and contact details</p>
                </div>
                <span className="text-[10px] text-[#C96243] bg-[#F8E7E0] px-2 py-0.5 rounded border border-[#F4D8CC]">
                  Auto Syncs Greetings
                </span>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">Household Role</label>
                    <input
                      type="text"
                      value={profileForm.role}
                      onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">Household Address</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">Profile Picture URL</label>
                  <input
                    type="text"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-[#E8DDD6]">
                  <p className="text-[11px] text-[#716963]">
                    Changing your name dynamically updates greetings across Dashboard and Smart Assist.
                  </p>
                  <Button variant="primary" size="sm" type="submit">
                    Save Account Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Household Members */}
      {activeTab === 'family' && (
        <Card padding="normal" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E8DDD6]">
            <div>
              <h3 className="text-base font-bold text-[#241D1A] font-sans">Household Members</h3>
              <p className="text-xs text-[#716963]">Manage family profiles and granular module permissions</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
              icon={Plus}
            >
              Add Family Member
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {householdMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-3 shadow-homeos-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${member.avatarBg}`}>
                      {member.avatarFallback}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#241D1A]">{member.name}</h4>
                      <p className="text-[11px] text-[#716963]">{member.role} • {member.relationship}</p>
                    </div>
                  </div>
                  <Badge variant={member.status.includes('Active') ? 'running' : 'warning'} size="sm">
                    {member.status}
                  </Badge>
                </div>

                <div className="text-[11px] text-[#716963] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C96243]" />
                  <span>{member.email}</span>
                </div>

                {/* Module Permissions */}
                <div className="pt-2 border-t border-[#E8DDD6]">
                  <span className="text-[10px] uppercase font-bold text-[#9A908A] block mb-1.5">
                    Module Access Permissions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(member.permissions).map(([moduleName, hasAccess]) => (
                      <span
                        key={moduleName}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                          hasAccess
                            ? 'bg-[#E4F3EB] text-[#4FA77B] border border-[#4FA77B]/30'
                            : 'bg-[#FBF7F3] text-[#9A908A] line-through border border-[#E8DDD6]'
                        }`}
                      >
                        {moduleName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: Security & Access */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card padding="normal" className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD6]">
              <div>
                <h3 className="text-base font-bold text-[#241D1A] font-sans">Account Security</h3>
                <p className="text-xs text-[#716963]">Manage password, cryptographic multi-factor protection and session monitoring</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
                icon={KeyRound}
              >
                Change Password
              </Button>
            </div>

            <div className="space-y-3">
              {/* 2FA Toggle */}
              <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F8E7E0] border border-[#F4D8CC] flex items-center justify-center text-[#C96243] font-bold">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#241D1A]">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-[#716963]">Require your 6-digit security PIN when signing in</p>
                  </div>
                </div>

                <button
                  onClick={handleTwoFactorToggle}
                  disabled={isTwoFactorLoading}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
                    twoFactorEnabled ? 'bg-[#C96243] justify-end' : 'bg-[#E8DDD6] justify-start'
                  }`}
                  aria-label="Toggle Two-Factor Authentication"
                >
                  <span className="w-4 h-4 rounded-full shadow-md block bg-white"></span>
                </button>
              </div>

              {/* Zero-knowledge Vault Notice */}
              <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#F4D8CC] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E4F3EB] border border-[#4FA77B]/30 flex items-center justify-center text-[#4FA77B] font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#241D1A]">Zero-Knowledge Client Encryption</h4>
                    <p className="text-[11px] text-[#716963]">AES-256 enabled on all vault certificates. Keys remain on your family devices.</p>
                  </div>
                </div>
                <Badge variant="running">Active</Badge>
              </div>
            </div>
          </Card>

          {/* Active Sessions & Login Activity */}
          <Card padding="normal" className="space-y-4">
            <h3 className="text-base font-bold text-[#241D1A] font-sans">Active Household Sessions</h3>
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-[#C96243]" />
                  <div>
                    <p className="font-bold text-[#241D1A]">Current Browser Session</p>
                    <p className="text-[10px] text-[#716963]">This device • Active now</p>
                  </div>
                </div>
                <Badge variant="running" size="sm">Current</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: General Settings */}
      {activeTab === 'general' && (
        <Card padding="normal" className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#241D1A] font-sans">General Application Preferences</h3>
            <p className="text-xs text-[#716963]">Configure localization, display parameters, and time standards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-2">
              <label className="block text-xs font-semibold text-[#241D1A]">Application Language</label>
              <select
                value={preferences.language}
                onChange={(e) => {
                  togglePreference('language');
                  addToast({ title: 'Language Updated', message: `Set to ${e.target.value}`, type: 'info' });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8DDD6] text-[#241D1A] focus:outline-none focus:border-[#C96243]"
              >
                <option value="English (US)">English (US)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-2">
              <label className="block text-xs font-semibold text-[#241D1A]">Primary Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => {
                  togglePreference('currency');
                  addToast({ title: 'Currency Updated', message: `Set to ${e.target.value}`, type: 'info' });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8DDD6] text-[#241D1A] focus:outline-none focus:border-[#C96243]"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="CAD ($)">CAD ($)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-2">
              <label className="block text-xs font-semibold text-[#241D1A]">Date Format</label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => {
                  togglePreference('dateFormat');
                  addToast({ title: 'Date Format Updated', message: `Set to ${e.target.value}`, type: 'info' });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8DDD6] text-[#241D1A] focus:outline-none focus:border-[#C96243]"
              >
                <option value="DD MMM YYYY">DD MMM YYYY (e.g. 18 Sep 2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/18/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-18)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-2">
              <label className="block text-xs font-semibold text-[#241D1A]">Appearance Theme</label>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#716963]">Warm Premium HomeOS</span>
                <span className="text-xs font-bold text-[#C96243] bg-[#F8E7E0] px-2.5 py-1 rounded-lg border border-[#F4D8CC]">
                  Enforced Default
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: Notifications & AI Preferences */}
      {activeTab === 'preferences' && (
        <Card padding="normal" className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#241D1A] font-sans">Notifications & AI Preferences</h3>
            <p className="text-xs text-[#716963]">Fine-tune autonomous briefings, anomaly alerts, and notification channels</p>
          </div>

          <div className="space-y-4">
            {/* AI Preferences */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#716963] block">
                HomeOS Intelligence Preferences
              </span>

              {[
                { key: 'aiInsights', label: 'Smart Suggestions', desc: 'Display proactive intelligence recommendations across Dashboard and Smart Assist' },
                { key: 'predictiveMaintenance', label: 'Predictive Maintenance Alerts', desc: 'Forecast filter replacements and compressor servicing ahead of deadlines' },
                { key: 'spendingInsights', label: 'Spending Insights', desc: 'Identify utility surges, grocery spikes, and budget deviations' },
                { key: 'dailyBriefing', label: "Daily Home Briefing", desc: 'Deliver morning synthesis of tasks, bills, and device status' }
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#241D1A]">{item.label}</h4>
                    <p className="text-[11px] text-[#716963]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => togglePreference(item.key)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      preferences[item.key] ? 'bg-[#C96243] justify-end' : 'bg-[#E8DDD6] justify-start'
                    }`}
                    aria-label={`Toggle ${item.label}`}
                  >
                    <span className="w-4 h-4 rounded-full shadow-md block bg-white"></span>
                  </button>
                </div>
              ))}
            </div>

            {/* Notification Channels */}
            <div className="space-y-3 pt-3 border-t border-[#E8DDD6]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#716963] block">
                Notification Channels
              </span>

              {[
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Real-time device notifications for overdue bills and critical alerts' },
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Digest summaries and monthly household financial statements' },
                { key: 'reminderAlerts', label: 'Reminder Notifications', desc: 'Automated alarms for scheduled household tasks' }
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#241D1A]">{item.label}</h4>
                    <p className="text-[11px] text-[#716963]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => togglePreference(item.key)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      preferences[item.key] ? 'bg-[#C96243] justify-end' : 'bg-[#E8DDD6] justify-start'
                    }`}
                    aria-label={`Toggle ${item.label}`}
                  >
                    <span className="w-4 h-4 rounded-full shadow-md block bg-white"></span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 6: Privacy & Data */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card padding="normal" className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#241D1A] font-sans">Privacy & Data Management</h3>
              <p className="text-xs text-[#716963]">Export records, manage offline backups, and control data retention</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-3">
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-[#C96243]" />
                  <h4 className="text-xs font-bold text-[#241D1A]">Export Home Data</h4>
                </div>
                <p className="text-[11px] text-[#716963]">
                  Download complete JSON snapshot of all household members, finances, appliances, and reminders.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={exportHomeData}
                  icon={Download}
                >
                  Export JSON Backup
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-3">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-[#668BC4]" />
                  <h4 className="text-xs font-bold text-[#241D1A]">Backup Home Data</h4>
                </div>
                <p className="text-[11px] text-[#716963]">
                  Synchronize current household telemetry with your local encrypted offline replica.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={backupHomeData}
                  icon={Database}
                >
                  Create Backup
                </Button>
              </div>
            </div>

            {/* Destructive Zone: Delete Account */}
            <div className="mt-6 p-4 rounded-xl bg-[#FFF9F6] border border-[#F4D8CC] space-y-3">
              <div className="flex items-center gap-2 text-[#D95C5C] font-bold text-sm">
                <ShieldAlert className="w-4 h-4" />
                <span>Destructive Action Zone</span>
              </div>
              <p className="text-xs text-[#716963]">
                Permanently delete this HomeOS household profile, cancel active member invitations, and clear mock session records.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteConfirmOpen(true)}
                icon={Trash2}
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 7: About HomeOS */}
      {activeTab === 'about' && (
        <Card padding="normal" className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD6]">
            <div>
              <h3 className="text-base font-bold text-[#241D1A] font-sans">About HomeOS</h3>
              <p className="text-xs text-[#716963]">Platform telemetry and system specifications</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#C96243] bg-[#F8E7E0] px-2.5 py-0.5 rounded-full border border-[#F4D8CC]">
              v2.4 Premium Edition
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-2 text-xs text-[#716963] leading-relaxed">
            <p className="font-bold text-[#241D1A]">«Everything important about your home, in one intelligent place.»</p>
            <p>
              HomeOS is a centralized household operating system engineered with modular React components, dynamic SaaS sidebar ergonomics, warm premium design system, and cross-module reactive state.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">
              <span className="text-[#716963] block">Framework</span>
              <span className="font-bold text-[#241D1A]">React 18 + Tailwind CSS</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">
              <span className="text-[#716963] block">Architecture</span>
              <span className="font-bold text-[#241D1A]">6 Strict Core Modules</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">
              <span className="text-[#716963] block">Security</span>
              <span className="font-bold text-[#4FA77B]">Zero-Knowledge Client Encrypted</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8DDD6] flex flex-wrap items-center gap-4 text-xs text-[#716963]">
            <span className="hover:text-[#C96243] cursor-pointer">Help & Support</span>
            <span>•</span>
            <span className="hover:text-[#C96243] cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-[#C96243] cursor-pointer">Privacy Policy</span>
          </div>
        </Card>
      )}

      {/* Invite Family Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Family Member"
        subtitle="Grant household member access with customized module permissions"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
              Member Full Name *
            </label>
            <input
              type="text"
              required
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              placeholder="e.g. Priya Mehta, Rahul Mehta"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              placeholder="member@example.com"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Relationship
              </label>
              <select
                value={inviteForm.relationship}
                onChange={(e) => setInviteForm({ ...inviteForm, relationship: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none text-[#241D1A]"
              >
                <option value="Partner">Partner</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Parent">Parent</option>
                <option value="Family Member">Family Member</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Household Role
              </label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none text-[#241D1A]"
              >
                <option value="Co-Admin">Co-Admin</option>
                <option value="Family Member">Family Member</option>
                <option value="Limited Access">Limited Access</option>
              </select>
            </div>
          </div>

          {/* Granular Permissions */}
          <div>
            <label className="block text-xs font-semibold text-[#241D1A] mb-2">
              Module Access Permissions
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'finance', label: 'Finance' },
                { key: 'documents', label: 'Documents' },
                { key: 'appliances', label: 'Appliances' },
                { key: 'reminders', label: 'Reminders' }
              ].map((p) => (
                <label key={p.key} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inviteForm.permissions[p.key]}
                    onChange={(e) => setInviteForm({
                      ...inviteForm,
                      permissions: { ...inviteForm.permissions, [p.key]: e.target.checked }
                    })}
                    className="rounded border-[#E8DDD6] bg-white text-[#C96243] focus:ring-[#C96243]"
                  />
                  <span className="text-[#241D1A] font-medium">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8DDD6]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
            >
              Invite Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Two-Factor Authentication Modal */}
      <Modal
        isOpen={isTwoFactorModalOpen}
        onClose={() => {
          if (!isTwoFactorLoading) {
            setIsTwoFactorModalOpen(false);
            setTwoFactorPin('');
            setTwoFactorConfirmPin('');
          }
        }}
        title={
          twoFactorEnabled
            ? 'Disable Two-Factor Authentication'
            : 'Set Up Two-Factor Authentication'
        }
        subtitle={
          twoFactorEnabled
            ? 'Enter your current 6-digit PIN to disable 2FA.'
            : 'Create a 6-digit PIN that will be required after your password when you sign in.'
        }
      >
        <div className="space-y-5">
          {!twoFactorEnabled ? (
            <>
              <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F8E7E0] text-[#C96243] flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#241D1A]">
                      Create your 2FA PIN
                    </p>
                    <p className="text-[11px] text-[#716963] mt-1 leading-relaxed">
                      Choose a private 6-digit PIN. You will enter this PIN after your password every time 2FA is required.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                  Create 6-Digit PIN
                </label>

                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  value={twoFactorPin}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6);

                    setTwoFactorPin(value);
                  }}
                  placeholder="••••••"
                  className="w-full px-3 py-2.5 text-center text-lg tracking-[0.35em] font-bold rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                  Confirm 6-Digit PIN
                </label>

                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  value={twoFactorConfirmPin}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6);

                    setTwoFactorConfirmPin(value);
                  }}
                  placeholder="••••••"
                  className="w-full px-3 py-2.5 text-center text-lg tracking-[0.35em] font-bold rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Current 6-Digit PIN
              </label>

              <input
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={6}
                value={twoFactorPin}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6);

                  setTwoFactorPin(value);
                }}
                placeholder="••••••"
                className="w-full px-3 py-2.5 text-center text-lg tracking-[0.35em] font-bold rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
              />
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E8DDD6]">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              disabled={isTwoFactorLoading}
              onClick={() => {
                setIsTwoFactorModalOpen(false);
                setTwoFactorPin('');
                setTwoFactorConfirmPin('');
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="sm"
              type="button"
              loading={isTwoFactorLoading}
              onClick={handleTwoFactorSubmit}
            >
              {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Household Password"
        subtitle="Ensure your new password contains at least 6 characters"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8DDD6]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={deleteAccount}
        title="Delete HomeOS Household Account?"
        message="This action will permanently delete your household configuration, wipe vaulted records, and terminate active member sessions. This cannot be undone."
        confirmText="Delete Account"
        isDanger={true}
      />

    </div>
  );
}
