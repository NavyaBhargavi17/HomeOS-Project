import React, { useState } from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '../ui/ToastContainer';
import { X } from 'lucide-react';
import bgImage from '../../assets/homeos-background.jpg';

export default function AppShell({ children }) {
  const { isSidebarCollapsed } = useHomeOs();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FBF7F3] text-[#241D1A] relative selection:bg-[#F4D8CC] selection:text-[#241D1A]">
      {/* Subtle background layer with soft warm overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#FBF7F3]/85 via-[#FBF7F3]/90 to-[#FBF7F3] backdrop-blur-[1px]" />

      {/* Dynamic Desktop Sidebar (Smooth Width Transition) */}
      <div
        className={`hidden lg:block shrink-0 z-20 h-screen sticky top-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64 sm:w-72'
        }`}
      >
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#241D1A]/35 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-homeos-lg border-r border-[#E8DDD6]">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-[#716963] hover:text-[#241D1A] bg-[#FFF9F6] border border-[#E8DDD6] transition-colors"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area: Automatically expands when sidebar collapses */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative transition-all duration-300 ease-in-out">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
}
