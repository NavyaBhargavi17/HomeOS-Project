import React from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import {
  LayoutDashboard,
  Wallet,
  FolderLock,
  Wrench,
  Sparkles,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function Sidebar({ onCloseMobile }) {
  const {
    currentRoute,
    navigate,
    currentUser,
    setIsAuthenticated,
    appliances,
    upcomingBills,
    isSidebarCollapsed,
    toggleSidebar
  } = useHomeOs();

  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  // Strict 6 core modules
  const navItems = [
    {
      id: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: '/finance',
      label: 'Finance Management',
      icon: Wallet,
      badge: upcomingBills.length > 0 ? `${upcomingBills.length} Bills` : null,
      badgeType: 'cyan'
    },
    {
      id: '/documents',
      label: 'Document Vault',
      icon: FolderLock,
      badge: null
    },
    {
      id: '/appliances',
      label: 'Appliance Maintenance',
      icon: Wrench,
      badge: appliances.some(a => a.status === 'Needs Service') ? '1 Alert' : null,
      badgeType: 'coral'
    },
    {
      id: '/smart-assist',
      label: 'Smart Assist & Reminders',
      icon: Sparkles,
      badge: 'AI Active',
      badgeType: 'cyan'
    },
    {
      id: '/settings',
      label: 'Settings & Accounts',
      icon: Settings,
      badge: null
    }
  ];

  const handleNav = (route) => {
    navigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setIsAuthenticated(false);
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <aside
      className={`h-full bg-white text-[#241D1A] flex flex-col border-r border-[#E8DDD6] select-none transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-64 sm:w-72'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-4 sm:p-5 border-b border-[#E8DDD6] flex items-center justify-between ${isSidebarCollapsed ? 'flex-col gap-3 px-2' : ''}`}>
        <button
          onClick={() => handleNav('/dashboard')}
          className="flex items-center gap-3 text-left group focus:outline-none"
          title="HomeOS Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-center shadow-sm relative shrink-0 group-hover:border-[#C96243] transition-colors">
            <Home className="w-5 h-5 text-[#C96243]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C96243] border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C96243] animate-ping"></span>
            </span>
          </div>

          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#241D1A] font-display">
                  Home<span className="text-[#C96243]">OS</span>
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-[#F4D8CC] text-[#C96243] border border-[#C96243]/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#716963] font-medium truncate">Household OS</p>
            </div>
          )}
        </button>

        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-2 rounded-xl text-[#9A908A] hover:text-[#241D1A] hover:bg-[#FFF9F6] transition-colors"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#C96243]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* System Intelligence Tag (Expanded view only) */}
      {!isSidebarCollapsed && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-between text-xs text-[#716963]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4FA77B] animate-pulse"></span>
            <span className="text-[11px] text-[#716963] font-medium">System Status: Nominal</span>
          </div>
          <span className="text-[10px] text-[#C96243] font-bold bg-[#F4D8CC] px-1.5 py-0.5 rounded border border-[#C96243]/30">
            ✦ AI Active
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {!isSidebarCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#9A908A]">
            Household Modules
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#F4D8CC] text-[#C96243] shadow-sm ' + (isSidebarCollapsed ? 'bg-[#F4D8CC] text-[#C96243]' : 'border-l-4 border-[#C96243] pl-2.5')
                    : 'text-[#716963] hover:bg-[#FFF9F6] hover:text-[#241D1A]'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} min-w-0`}>
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#C96243] text-white'
                        : 'bg-[#FFF9F6] text-[#716963] group-hover:text-[#C96243] group-hover:bg-[#F4D8CC]/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="truncate tracking-wide">{item.label}</span>
                  )}
                </div>

                {!isSidebarCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.badgeType === 'coral'
                        ? 'bg-[#FBE6E6] text-[#D95C5C] border border-[#D95C5C]/30 animate-pulse'
                        : 'bg-white text-[#C96243] border border-[#C96243]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Tooltip on Hover when Collapsed */}
              {isSidebarCollapsed && (
                <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-xl bg-white border border-[#E8DDD6] text-[#241D1A] text-xs font-semibold shadow-homeos-lg whitespace-nowrap z-50 items-center gap-2 pointer-events-none animate-fadeIn">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F4D8CC] text-[#C96243]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom User Profile Area & Logout */}
      <div className="p-3 sm:p-4 border-t border-[#E8DDD6] bg-[#FFF9F6]/50">
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between gap-2'} p-2 rounded-xl bg-white border border-[#E8DDD6]`}>
          <button
            onClick={() => handleNav('/settings')}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'} min-w-0 flex-1 text-left group`}
            title={`${currentUser.name} (${currentUser.role})`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#F4D8CC] text-[#C96243] font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:ring-2 group-hover:ring-[#C96243] transition-all">
              {currentUser.avatarFallback || 'AM'}
            </div>

            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#241D1A] truncate group-hover:text-[#C96243] transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-[#716963] truncate">
                  {currentUser.role}
                </p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <ChevronRight className="w-3.5 h-3.5 text-[#9A908A] group-hover:text-[#C96243] transition-colors shrink-0" />
            )}
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#9A908A] hover:text-[#D95C5C] hover:bg-[#FBE6E6] transition-colors shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="mt-3 flex items-center justify-between text-[10px] text-[#9A908A] px-1">
            <span>HomeOS v2.4</span>
            <span className="flex items-center gap-1 text-[#4FA77B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4FA77B]"></span>
              Encrypted
            </span>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={cancelLogout}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            className="w-full max-w-sm rounded-2xl bg-white border border-[#E8DDD6] shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FBE6E6] text-[#D95C5C] flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h2 id="logout-dialog-title" className="text-base font-bold text-[#241D1A]">
                  Log out?
                </h2>
                <p className="text-xs text-[#716963] mt-0.5">
                  Are you sure you want to log out of HomeOS?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelLogout}
                className="px-4 py-2 rounded-xl border border-[#E8DDD6] bg-white text-[#716963] text-sm font-semibold hover:bg-[#FFF9F6] hover:text-[#241D1A] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-4 py-2 rounded-xl bg-[#D95C5C] text-white text-sm font-semibold hover:bg-[#C94D4D] transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
