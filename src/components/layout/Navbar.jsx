import React, { useState, useEffect } from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import { Home, Menu, X, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

export default function Navbar() {
  const { navigate, isAuthenticated } = useHomeOs();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E8DDD6]'
          : 'bg-[#FBF7F3]/90 backdrop-blur-sm border-b border-[#E8DDD6]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-center shadow-sm group-hover:border-[#C96243] transition-all">
              <Home className="w-5 h-5 text-[#C96243]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-[#241D1A] font-display">
                Home<span className="text-[#C96243]">OS</span>
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#F4D8CC] text-[#C96243] border border-[#C96243]/30 hidden sm:inline-block">
                AI Household OS
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#716963]">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#241D1A] transition-colors font-semibold"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#241D1A] transition-colors font-semibold"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('ai-intelligence')}
              className="hover:text-[#241D1A] transition-colors font-semibold flex items-center gap-1.5"
            >
              <span>AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-[#C96243] animate-pulse"></span>
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="hover:text-[#241D1A] transition-colors font-semibold"
            >
              Security
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard')}
                icon={ArrowRight}
                iconPosition="right"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/login')}
                  className="font-bold text-[#241D1A] hover:text-[#C96243]"
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/login')}
                  className="shadow-sm"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            >
              {isAuthenticated ? 'Dashboard' : 'Sign In'}
            </Button>
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="p-2 text-[#716963] hover:text-[#241D1A] hover:bg-[#FFF9F6] rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-b border-[#E8DDD6] px-6 py-5 shadow-homeos-lg space-y-4 animate-fadeIn">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-[#716963]">
            <button
              onClick={() => scrollToSection('features')}
              className="text-left py-2 border-b border-[#E8DDD6] hover:text-[#241D1A]"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-2 border-b border-[#E8DDD6] hover:text-[#241D1A]"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('ai-intelligence')}
              className="text-left py-2 border-b border-[#E8DDD6] hover:text-[#241D1A] flex items-center justify-between"
            >
              <span>AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-[#C96243]"></span>
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="text-left py-2 border-b border-[#E8DDD6] hover:text-[#241D1A]"
            >
              Security
            </button>
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => navigate('/login')}
            >
              Get Started
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={() => navigate('/login')}
            >
              Sign In to Account
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
