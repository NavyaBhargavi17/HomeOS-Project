import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import {
  Bell,
  Search,
  Menu,
  CheckCheck,
  ChevronDown,
  X
} from 'lucide-react';

export default function Header({ onOpenMobileMenu }) {
  const {
    currentRoute,
    currentUser,
    notifications,
    markAllNotificationsRead,
    navigate
  } = useHomeOs();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const firstName = currentUser?.name
    ? currentUser.name.split(' ')[0]
    : 'there';

  const pageMeta = {
    '/dashboard': {
      title: 'Household Command Center',
      subtitle: `Good morning, ${firstName} 👋 Here's what's happening around your home.`
    },
    '/finance': {
      title: 'Finance Management',
      subtitle: 'Understand where your household money goes and track bills effortlessly.'
    },
    '/documents': {
      title: 'Document Vault',
      subtitle: "Keep your family's personal and legal documents organized, encrypted and accessible."
    },
    '/appliances': {
      title: 'Appliance Maintenance',
      subtitle: 'Keep your household appliances healthy, monitored and running smoothly.'
    },
    '/smart-assist': {
      title: 'Smart Assist & Reminders',
      subtitle: 'Your intelligent companion for managing everyday routines, alerts and inquiries.'
    },
    '/settings': {
      title: 'Settings & Accounts',
      subtitle: 'Manage your household profiles, member permissions, security and HomeOS preferences.'
    }
  };

  const currentMeta = pageMeta[currentRoute] || {
    title: 'HomeOS Intelligence',
    subtitle: 'Intelligent Household Management Platform'
  };

  // Global searchable sections
  const searchItems = [
    {
      label: 'Dashboard',
      description: 'Household Command Center',
      path: '/dashboard',
      keywords: [
        'dashboard',
        'home',
        'household',
        'command center',
        'overview'
      ]
    },
    {
      label: 'Finance',
      description: 'Manage money, expenses and transactions',
      path: '/finance',
      keywords: [
        'finance',
        'money',
        'expense',
        'expenses',
        'income',
        'transaction',
        'transactions',
        'budget',
        'savings'
      ]
    },
    {
      label: 'Bills',
      description: 'Track and manage household bills',
      path: '/finance',
      keywords: [
        'bill',
        'bills',
        'payment',
        'payments',
        'due',
        'overdue',
        'electricity',
        'water',
        'insurance'
      ]
    },
    {
      label: 'Documents',
      description: 'Secure household document vault',
      path: '/documents',
      keywords: [
        'document',
        'documents',
        'vault',
        'certificate',
        'certificates',
        'files',
        'file',
        'legal'
      ]
    },
    {
      label: 'Appliances',
      description: 'Monitor and maintain household appliances',
      path: '/appliances',
      keywords: [
        'appliance',
        'appliances',
        'maintenance',
        'repair',
        'service',
        'ac',
        'refrigerator',
        'washing machine',
        'purifier'
      ]
    },
    {
      label: 'Smart Assist',
      description: 'Reminders, alerts and household assistance',
      path: '/smart-assist',
      keywords: [
        'smart',
        'assist',
        'assistant',
        'reminder',
        'reminders',
        'alert',
        'alerts',
        'schedule',
        'tasks'
      ]
    },
    {
      label: 'Settings',
      description: 'Manage your account and preferences',
      path: '/settings',
      keywords: [
        'settings',
        'account',
        'profile',
        'preferences',
        'security',
        'password',
        'household members'
      ]
    }
  ];

  // Search results
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    return searchItems.filter(item => {
      const searchableText = [
        item.label,
        item.description,
        ...item.keywords
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery]);

  // Close notifications and search when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigate from search result
  const handleSearchResult = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    function handleKeyboardShortcut(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();

        const input = searchRef.current?.querySelector('input');

        if (input) {
          input.focus();
          setShowSearchResults(true);
        }
      }

      if (e.key === 'Escape') {
        setShowSearchResults(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('keydown', handleKeyboardShortcut);

    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8DDD6] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">

      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4">

        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[#716963] hover:text-[#241D1A] hover:bg-[#FFF9F6] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">

            <h1 className="text-lg sm:text-xl font-bold text-[#241D1A] font-display tracking-tight">
              {currentMeta.title}
            </h1>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4F3EB] text-[#4FA77B] border border-[#4FA77B]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4FA77B] animate-pulse"></span>
              Live Sync
            </span>

          </div>

          <p className="text-xs text-[#716963] hidden md:block mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications & Account */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">

        {/* ================= GLOBAL SEARCH ================= */}
        <div
          ref={searchRef}
          className="relative hidden md:block w-48 lg:w-64"
        >

          <Search className="w-4 h-4 text-[#9A908A] absolute left-3 top-1/2 -translate-y-1/2 z-10" />

          <input
            type="text"
            placeholder="Search household..."
            value={searchQuery}
            onFocus={() => {
              if (searchQuery.trim()) {
                setShowSearchResults(true);
              }
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            className="w-full pl-9 pr-9 py-1.5 text-xs bg-[#FBF7F3] rounded-xl border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] transition-all text-[#241D1A] placeholder:text-[#9A908A]"
            aria-label="Search household"
            aria-expanded={showSearchResults}
          />

          {/* Clear button */}
          {searchQuery ? (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A908A] hover:text-[#C96243] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-[#9A908A] absolute right-2.5 top-1/2 -translate-y-1/2 bg-white px-1.5 py-0.5 rounded border border-[#E8DDD6]">
              ⌘K
            </span>
          )}

          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute right-0 top-full mt-2 w-72 lg:w-80 bg-white rounded-2xl border border-[#E8DDD6] shadow-homeos-lg z-50 overflow-hidden animate-fadeIn">

              {/* Results header */}
              <div className="px-4 py-2.5 bg-[#FFF9F6] border-b border-[#E8DDD6]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A908A]">
                  Search Results
                </p>
              </div>

              {searchResults.length > 0 ? (
                <div className="py-1">

                  {searchResults.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleSearchResult(item.path)}
                      className="w-full text-left px-4 py-3 hover:bg-[#FFF9F6] transition-colors border-b border-[#F5EFEB] last:border-b-0"
                    >
                      <div className="flex items-center gap-3">

                        <div className="w-8 h-8 rounded-lg bg-[#F4D8CC] text-[#C96243] flex items-center justify-center shrink-0">
                          <Search className="w-3.5 h-3.5" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#241D1A]">
                            {item.label}
                          </p>

                          <p className="text-[10px] text-[#716963] mt-0.5 truncate">
                            {item.description}
                          </p>
                        </div>

                      </div>
                    </button>
                  ))}

                </div>
              ) : (
                <div className="px-4 py-7 text-center">

                  <Search className="w-7 h-7 text-[#D8CEC8] mx-auto mb-2" />

                  <p className="text-xs font-semibold text-[#716963]">
                    No results found
                  </p>

                  <p className="text-[10px] text-[#9A908A] mt-1">
                    Try searching for finance, documents, appliances or settings.
                  </p>

                </div>
              )}

              {/* Search hint */}
              {searchResults.length > 0 && (
                <div className="px-4 py-2 bg-[#FBF7F3] border-t border-[#E8DDD6]">
                  <p className="text-[10px] text-[#9A908A]">
                    Click a result to open that section
                  </p>
                </div>
              )}

            </div>
          )}
        </div>

        {/* ================= NOTIFICATIONS ================= */}
        <div className="relative" ref={notifRef}>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-white border border-[#E8DDD6] text-[#716963] hover:text-[#241D1A] hover:border-[#C96243] transition-colors relative shadow-sm"
            title="Household Alerts"
            aria-label="Household Alerts"
          >
            <Bell className="w-4 h-4" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D95C5C] text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E8DDD6] shadow-homeos-lg z-50 overflow-hidden animate-fadeIn">

              <div className="px-4 py-3 bg-[#FFF9F6] border-b border-[#E8DDD6] flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <h4 className="text-xs font-bold text-[#241D1A] tracking-wide">
                    Household Alerts
                  </h4>

                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#FBE6E6] text-[#D95C5C] text-[10px] font-bold border border-[#D95C5C]/30">
                      {unreadCount} new
                    </span>
                  )}

                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#C96243] hover:text-[#AE4F35] flex items-center gap-1 font-semibold transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}

              </div>

              <div className="divide-y divide-[#F0E7E2] max-h-80 overflow-y-auto">

                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#9A908A]">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-[#FFF9F6] transition-colors flex items-start gap-3 ${
                        n.unread ? 'bg-[#FFF9F6]/60' : ''
                      }`}
                    >

                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          n.unread
                            ? 'bg-[#C96243]'
                            : 'bg-[#E8DDD6]'
                        }`}
                      />

                      <div className="flex-1 min-w-0">

                        <p className="text-xs font-bold text-[#241D1A]">
                          {n.title}
                        </p>

                        <p className="text-xs text-[#716963] mt-0.5">
                          {n.description}
                        </p>

                        <span className="text-[10px] text-[#9A908A] mt-1 block">
                          {n.time}
                        </span>

                      </div>

                    </div>
                  ))
                )}

              </div>

              <div className="p-2.5 bg-[#FFF9F6] border-t border-[#E8DDD6] text-center">

                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/smart-assist');
                  }}
                  className="text-xs font-semibold text-[#C96243] hover:text-[#AE4F35] transition-colors"
                >
                  View in Smart Assist →
                </button>

              </div>

            </div>
          )}

        </div>

        {/* ================= USER PILL ================= */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-white border border-[#E8DDD6] hover:border-[#C96243]/50 transition-colors shadow-sm group"
          title="Manage Account"
        >

          <div className="w-7 h-7 rounded-lg bg-[#F4D8CC] text-[#C96243] font-bold text-xs flex items-center justify-center shrink-0">
            {currentUser?.avatarFallback || 'AM'}
          </div>

          <div className="text-left hidden sm:block">

            <span className="text-xs font-bold text-[#241D1A] block leading-none group-hover:text-[#C96243] transition-colors">
              {currentUser?.name || 'User'}
            </span>

            <span className="text-[10px] text-[#716963] font-medium leading-none">
              {currentUser?.role || 'Member'}
            </span>

          </div>

          <ChevronDown className="w-3.5 h-3.5 text-[#9A908A] group-hover:text-[#C96243] hidden sm:block transition-colors" />

        </button>

      </div>
    </header>
  );
}