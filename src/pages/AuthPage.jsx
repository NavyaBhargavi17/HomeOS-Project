import React, { useEffect, useRef, useState } from 'react';
import { useHomeOs } from '../context/HomeOsContext';

import Button from '../components/ui/Button';

import {
  Home,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  User,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const API_URL = "https://homeos-project.onrender.com/api";
const GOOGLE_CLIENT_ID ='67049280847-9rs10rbb97s3tctcr8io1c4n9tc1issi.apps.googleusercontent.com'

export default function AuthPage() {
  const { navigate, setIsAuthenticated, addToast } = useHomeOs();

  const googleButtonRef = useRef(null);

  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // 2FA LOGIN STATE
  // ==========================================
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorPin, setTwoFactorPin] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  const validate = () => {
    const errs = {};

    if (mode === 'signup' && !formData.name.trim()) {
      errs.name = 'Please enter your full name';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (
      mode === 'signup' &&
      formData.password !== formData.confirmPassword
    ) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // ==========================================
  // COMPLETE LOGIN AFTER 2FA
  // ==========================================
  const completeTwoFactorLogin = async () => {
    if (!twoFactorPin.trim()) {
      setAuthError('Please enter your 6-digit 2FA PIN.');
      return;
    }

    if (!/^\d{6}$/.test(twoFactorPin.trim())) {
      setAuthError('Please enter your 6-digit 2FA PIN.');
      return;
    }

    setAuthError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/2fa/verify-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            twoFactorToken,
            pin: twoFactorPin.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Two-factor authentication failed'
        );
      }

      // Store the REAL JWT returned after successful 2FA
      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      if (data.token) {
        storage.setItem('homeos_token', data.token);
      }

      if (data.user) {
        storage.setItem(
          'homeos_user',
          JSON.stringify(data.user)
        );
      }

      setIsAuthenticated(true);

      addToast({
        title: 'Welcome Back!',
        message: `Signed in as ${data.user.name}. Entering your household...`,
        type: 'success'
      });

      navigate('/dashboard');
    } catch (error) {
      const message =
        error.message || 'Two-factor authentication failed';

      setAuthError(message);

      addToast({
        title: 'Authentication Failed',
        message,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // REAL LOGIN / SIGNUP API
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setAuthError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const endpoint =
        mode === 'login'
          ? `${API_URL}/auth/login`
          : `${API_URL}/auth/register`;

      const body =
        mode === 'login'
          ? {
              email: formData.email,
              password: formData.password
            }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Authentication failed'
        );
      }

      // ==========================================
      // 2FA REQUIRED
      // ==========================================
      if (
        mode === 'login' &&
        data.requiresTwoFactor &&
        data.twoFactorToken
      ) {
        setTwoFactorToken(data.twoFactorToken);
        setRequiresTwoFactor(true);
        setTwoFactorPin('');

        addToast({
          title: 'Two-Factor Authentication',
          message:
            'Enter your 6-digit 2FA PIN to continue.',
          type: 'info'
        });

        return;
      }

      // ==========================================
      // NORMAL AUTHENTICATION
      // ==========================================

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      if (data.token) {
        storage.setItem('homeos_token', data.token);
      }

      if (data.user) {
        storage.setItem(
          'homeos_user',
          JSON.stringify(data.user)
        );
      }

      setIsAuthenticated(true);

      addToast({
        title:
          mode === 'login'
            ? 'Welcome Back!'
            : 'Account Created!',
        message: `Signed in as ${data.user.name}. Entering your household...`,
        type: 'success'
      });

      navigate('/dashboard');

    } catch (error) {
      const message =
        error.message || 'Authentication failed';

      setAuthError(message);

      addToast({
        title: 'Authentication Failed',
        message,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // BACK FROM 2FA
  // ==========================================
  const cancelTwoFactorLogin = () => {
    setRequiresTwoFactor(false);
    setTwoFactorToken('');
    setTwoFactorPin('');
    setAuthError('');
    setIsLoading(false);
  };

  // ==========================================
  // GOOGLE SIGN-IN
  // ==========================================
  const handleGoogleCredential = async (response) => {
    if (!response?.credential) {
      setAuthError(
        'Google Sign-In did not return a credential.'
      );
      return;
    }

    setAuthError('');
    setIsLoading(true);

    try {
      const apiResponse = await fetch(
        `${API_URL}/auth/google`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            credential: response.credential
          })
        }
      );

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(
          data.message || 'Google authentication failed'
        );
      }

      // ==========================================
      // GOOGLE LOGIN + PIN 2FA
      // ==========================================
      if (
        data.requiresTwoFactor &&
        data.twoFactorToken
      ) {
        setTwoFactorToken(data.twoFactorToken);
        setRequiresTwoFactor(true);
        setTwoFactorPin('');

        addToast({
          title: 'Two-Factor Authentication',
          message:
            'Enter your 6-digit 2FA PIN to continue.',
          type: 'info'
        });

        return;
      }

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      if (data.token) {
        storage.setItem(
          'homeos_token',
          data.token
        );
      }

      if (data.user) {
        storage.setItem(
          'homeos_user',
          JSON.stringify(data.user)
        );
      }

      setIsAuthenticated(true);

      addToast({
        title: 'Google Sign-In Successful',
        message: `Welcome, ${data.user.name}. Entering your household...`,
        type: 'success'
      });

      navigate('/dashboard');

    } catch (error) {
      const message =
        error.message ||
        'Google authentication failed';

      setAuthError(message);

      addToast({
        title: 'Google Sign-In Failed',
        message,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // GOOGLE IDENTITY SERVICES
  // ==========================================
  useEffect(() => {
    const renderGoogleButton = () => {
      if (
        !window.google?.accounts?.id ||
        !googleButtonRef.current
      ) {
        return false;
      }

      googleButtonRef.current.innerHTML = '';

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 360
        }
      );

      return true;
    };

    if (renderGoogleButton()) {
      return undefined;
    }

    const existingScript = document.querySelector(
      'script[data-google-identity-services]'
    );

    if (existingScript) {
      const interval = setInterval(() => {
        if (renderGoogleButton()) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }

    const script = document.createElement('script');

    script.src =
      'https://accounts.google.com/gsi/client';

    script.async = true;
    script.defer = true;
    script.dataset.googleIdentityServices = 'true';

    script.onload = () => {
      renderGoogleButton();
    };

    document.head.appendChild(script);

    return () => {
      // Keep the shared Google GIS script loaded
      // for navigation within the SPA.
    };
  }, []);

  // ==========================================
  // SWITCH LOGIN / SIGNUP MODE
  // ==========================================
  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setAuthError('');

    setRequiresTwoFactor(false);
    setTwoFactorToken('');
    setTwoFactorPin('');

    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FBF7F3] text-[#241D1A] selection:bg-[#F4D8CC] selection:text-[#241D1A]">

      {/* ==========================================
          LEFT PANEL
          ========================================== */}
      <div className="lg:w-1/2 bg-[#FFF9F6] text-[#241D1A] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E8DDD6]">

        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#F4D8CC]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#FFF1D8]/50 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >

            <div className="w-11 h-11 rounded-xl bg-white border border-[#E8DDD6] shadow-sm flex items-center justify-center group-hover:border-[#C96243] transition-colors">
              <Home className="w-6 h-6 text-[#C96243]" />
            </div>

            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#241D1A] font-display">
                Home<span className="text-[#C96243]">OS</span>
              </span>

              <p className="text-[11px] text-[#716963]">
                Household Operating System
              </p>
            </div>

          </button>

        </div>

        {/* Hero Narrative */}
        <div className="my-12 lg:my-0 relative z-10 max-w-lg space-y-6">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8DDD6] shadow-xs text-[#C96243] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 fill-[#C96243]" />
            <span>AI Household Management</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#241D1A] tracking-tight leading-tight font-display">
            Welcome to a calmer way to manage your home.
          </h2>

          <p className="text-sm sm:text-base text-[#716963] leading-relaxed">
            HomeOS brings your finances, documents, appliances,
            reminders and everyday household management into one
            intelligent platform.
          </p>

          {/* Household Telemetry */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8DDD6] shadow-homeos space-y-3">

            <div className="flex items-center justify-between text-xs text-[#716963] pb-2 border-b border-[#F0E7E2] font-semibold">

              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4FA77B] animate-pulse" />

                <span className="text-[#241D1A]">
                  Family Command
                </span>
              </span>

              <span className="text-[#C96243] font-bold">
                4 Active Members
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">

              <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">

                <span className="text-[10px] text-[#9A908A] block">
                  Upcoming Bill
                </span>

                <span className="font-bold text-[#241D1A]">
                  Electricity • Due Tomorrow
                </span>

              </div>

              <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">

                <span className="text-[10px] text-[#9A908A] block">
                  Vault Security
                </span>

                <span className="font-bold text-[#4FA77B]">
                  Zero-Knowledge Encrypted
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#716963] pt-4 border-t border-[#E8DDD6]">

          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#4FA77B]" />
            Zero-knowledge household vault
          </span>

          <span className="text-[#9A908A]">
            © 2026 HomeOS
          </span>

        </div>

      </div>

      {/* ==========================================
          RIGHT PANEL
          ========================================== */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-[#FBF7F3]">

        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#E8DDD6] shadow-homeos-lg">

          {/* ==========================================
              2FA LOGIN SCREEN
              ========================================== */}
          {requiresTwoFactor ? (

            <div className="space-y-6">

              <div className="text-center">

                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#FFF1EC] border border-[#E8DDD6] flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-[#C96243]" />
                </div>

                <h3 className="text-2xl font-extrabold text-[#241D1A] font-display tracking-tight">
                  Two-Factor Authentication
                </h3>

                <p className="text-xs text-[#716963] mt-2 leading-relaxed">
                  Enter your 6-digit 2FA PIN to continue.
                </p>

              </div>

              {/* AUTH ERROR */}
              {authError && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FBE6E6] border border-[#D95C5C]/30 text-[#D95C5C]">

                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />

                  <div>
                    <p className="text-xs font-bold">
                      Authentication Failed
                    </p>

                    <p className="text-[11px] mt-0.5">
                      {authError}
                    </p>
                  </div>

                </div>
              )}

              <div>

                <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                  2FA PIN
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={twoFactorPin}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6);

                    setTwoFactorPin(value);
                    setAuthError('');
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-lg tracking-[0.35em] font-bold rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
                />

              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                loading={isLoading}
                onClick={completeTwoFactorLogin}
                className="w-full font-bold shadow-md"
              >
                Verify & Sign In
              </Button>

              <button
                type="button"
                onClick={cancelTwoFactorLogin}
                disabled={isLoading}
                className="w-full text-xs font-semibold text-[#716963] hover:text-[#C96243] transition-colors disabled:opacity-50"
              >
                Back to Sign In
              </button>

              <p className="text-center text-[11px] text-[#9A908A] leading-relaxed">
                Enter the 6-digit PIN you created in
                your HomeOS security settings.
              </p>

            </div>

          ) : (

            <>
              {/* ==========================================
                  HEADER
                  ========================================== */}
              <div className="mb-6">

                <h3 className="text-2xl font-extrabold text-[#241D1A] font-display tracking-tight">
                  {mode === 'login'
                    ? 'Welcome back'
                    : 'Create your HomeOS account'}
                </h3>

                <p className="text-xs text-[#716963] mt-1">
                  {mode === 'login'
                    ? 'Sign in to continue to your HomeOS household.'
                    : 'Join modern households experiencing intelligent home management.'}
                </p>

              </div>

              {/* ==========================================
                  MODE SWITCHER
                  ========================================== */}
              <div className="flex rounded-xl bg-[#FFF9F6] p-1 border border-[#E8DDD6] mb-6">

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-[#C96243] text-white shadow-sm'
                      : 'text-[#716963] hover:text-[#241D1A]'
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-[#C96243] text-white shadow-sm'
                      : 'text-[#716963] hover:text-[#241D1A]'
                  }`}
                >
                  Create Account
                </button>

              </div>

              {/* ==========================================
                  FORM
                  ========================================== */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* AUTH ERROR */}
                {authError && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FBE6E6] border border-[#D95C5C]/30 text-[#D95C5C]">

                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />

                    <div>
                      <p className="text-xs font-bold">
                        Authentication Failed
                      </p>

                      <p className="text-[11px] mt-0.5">
                        {authError}
                      </p>
                    </div>

                  </div>
                )}

                {/* ==========================================
                    NAME
                    ========================================== */}
                {mode === 'signup' && (
                  <div>

                    <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                      Full Name
                    </label>

                    <div className="relative">

                      <User className="w-4 h-4 text-[#9A908A] absolute left-3 top-1/2 -translate-y-1/2" />

                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            name: e.target.value
                          });

                          setAuthError('');
                        }}
                        placeholder="e.g. Arjun Mehta"
                        className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-[#FBF7F3] border focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A] ${
                          errors.name
                            ? 'border-[#D95C5C]'
                            : 'border-[#E8DDD6]'
                        }`}
                      />

                    </div>

                    {errors.name && (
                      <p className="text-[11px] text-[#D95C5C] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.name}</span>
                      </p>
                    )}

                  </div>
                )}

                {/* ==========================================
                    EMAIL
                    ========================================== */}
                <div>

                  <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail className="w-4 h-4 text-[#9A908A] absolute left-3 top-1/2 -translate-y-1/2" />

                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          email: e.target.value
                        });

                        setAuthError('');
                      }}
                      placeholder="name@household.com"
                      className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-[#FBF7F3] border focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A] ${
                        errors.email
                          ? 'border-[#D95C5C]'
                          : 'border-[#E8DDD6]'
                      }`}
                    />

                  </div>

                  {errors.email && (
                    <p className="text-[11px] text-[#D95C5C] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}

                </div>

                {/* ==========================================
                    PASSWORD
                    ========================================== */}
                <div>

                  <div className="flex items-center justify-between mb-1.5">

                    <label className="block text-xs font-bold text-[#241D1A]">
                      Password
                    </label>

                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() =>
                          addToast({
                            title: 'Password Reset',
                            message:
                              'Recovery link dispatched to registered email',
                            type: 'info'
                          })
                        }
                        className="text-[11px] text-[#C96243] hover:text-[#AE4F35] font-semibold transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}

                  </div>

                  <div className="relative">

                    <Lock className="w-4 h-4 text-[#9A908A] absolute left-3 top-1/2 -translate-y-1/2" />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          password: e.target.value
                        });

                        setAuthError('');
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-[#FBF7F3] border focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A] ${
                        errors.password
                          ? 'border-[#D95C5C]'
                          : 'border-[#E8DDD6]'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A908A] hover:text-[#241D1A]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                  </div>

                  {errors.password && (
                    <p className="text-[11px] text-[#D95C5C] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.password}</span>
                    </p>
                  )}

                </div>

                {/* ==========================================
                    CONFIRM PASSWORD
                    ========================================== */}
                {mode === 'signup' && (
                  <div>

                    <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                      Confirm Password
                    </label>

                    <div className="relative">

                      <Lock className="w-4 h-4 text-[#9A908A] absolute left-3 top-1/2 -translate-y-1/2" />

                      <input
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value
                          })
                        }
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-[#FBF7F3] border focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A] ${
                          errors.confirmPassword
                            ? 'border-[#D95C5C]'
                            : 'border-[#E8DDD6]'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A908A] hover:text-[#241D1A]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                    </div>

                    {errors.confirmPassword && (
                      <p className="text-[11px] text-[#D95C5C] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.confirmPassword}</span>
                      </p>
                    )}

                  </div>
                )}

                {/* ==========================================
                    REMEMBER ME
                    ========================================== */}
                {mode === 'login' && (
                  <div className="flex items-center gap-2 pt-1">

                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(e.target.checked)
                      }
                      className="rounded border-[#E8DDD6] bg-[#FBF7F3] text-[#C96243] focus:ring-[#C96243] accent-[#C96243]"
                    />

                    <label
                      htmlFor="rememberMe"
                      className="text-xs text-[#716963] select-none cursor-pointer"
                    >
                      Remember this device for 30 days
                    </label>

                  </div>
                )}

                {/* ==========================================
                    SUBMIT
                    ========================================== */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  className="w-full mt-2 font-bold shadow-md"
                >
                  {mode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
                </Button>

              </form>

              {/* ==========================================
                  DIVIDER
                  ========================================== */}
              <div className="relative my-6 text-center">

                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8DDD6]" />
                </div>

                <span className="relative px-3 bg-white text-[11px] uppercase font-bold text-[#9A908A]">
                  or continue with
                </span>

              </div>

              {/* ==========================================
                  GOOGLE SIGN-IN
                  ========================================== */}
              <div className="w-full flex justify-center min-h-[44px]">

                <div
                  ref={googleButtonRef}
                  className="max-w-full overflow-hidden"
                />

              </div>

              {/* ==========================================
                  TOGGLE
                  ========================================== */}
              <p className="text-center text-xs text-[#716963] mt-6">

                {mode === 'login' ? (

                  <>
                    Don't have an account?{' '}

                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="font-bold text-[#C96243] hover:underline"
                    >
                      Create one
                    </button>
                  </>

                ) : (

                  <>
                    Already have an account?{' '}

                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#C96243] hover:underline"
                    >
                      Sign in
                    </button>
                  </>

                )}

              </p>

            </>

          )}

        </div>

      </div>

    </div>
  );
}