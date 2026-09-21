import React from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import {
  Home,
  ShieldCheck,
  ArrowUp,
  ArrowRight,
  Sparkles,
  Mail,
  Lock
} from 'lucide-react';

export default function Footer() {
  const { navigate } = useHomeOs();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <footer className="relative bg-[#24211F] text-white overflow-hidden">

      {/* =====================================================
          SUBTLE BACKGROUND DETAILS
      ===================================================== */}

      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C96243]/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F4D8CC]/5 rounded-full blur-[100px] pointer-events-none" />


      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===================================================
            MAIN FOOTER
        =================================================== */}

        <div className="py-16 md:py-20">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">


            {/* =================================================
                BRAND
            ================================================= */}

            <div className="lg:col-span-1 space-y-6">

              {/* Logo */}

              <button
                onClick={scrollToTop}
                className="flex items-center gap-3 group"
              >

                <div className="w-11 h-11 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shadow-sm group-hover:bg-white/12 group-hover:border-white/15 transition-all duration-200">

                  <Home className="w-5 h-5 text-[#F4B9A5]" />

                </div>

                <span className="font-extrabold text-2xl tracking-tight text-white font-display">

                  Home<span className="text-[#D9785A]">OS</span>

                </span>

              </button>


              {/* Description */}

              <p className="text-sm text-[#C9C0BC] leading-relaxed max-w-xs">

                Your home's finances, documents, appliances, reminders and
                everyday management — intelligently connected in one place.

              </p>


              {/* Security Badge */}

              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/6 border border-white/10">

                <ShieldCheck className="w-4 h-4 text-[#A9DCC2]" />

                <span className="text-xs font-semibold text-[#F3EFED]">

                  Secure household intelligence

                </span>

              </div>


              {/* Tagline */}

              <div className="flex items-center gap-2 text-xs text-[#AFA7A3]">

                <Sparkles className="w-3.5 h-3.5 text-[#D9785A]" />

                <span>Built for smarter homes.</span>

              </div>

            </div>


            {/* =================================================
                HOUSEHOLD MODULES
            ================================================= */}

            <div className="space-y-5">

              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#F0C7B8]">
                Household
              </h4>


              <ul className="space-y-2.5">

                <li>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="group flex items-center gap-2 text-sm text-[#BDB5B1] hover:text-white transition-colors"
                  >
                    Dashboard

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>


                <li>
                  <button
                    onClick={() => navigate('/finance')}
                    className="group flex items-center gap-2 text-sm text-[#BDB5B1] hover:text-white transition-colors"
                  >
                    Finance Management

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>


                <li>
                  <button
                    onClick={() => navigate('/documents')}
                    className="group flex items-center gap-2 text-sm text-[#BDB5B1] hover:text-white transition-colors"
                  >
                    Document Vault

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>


                <li>
                  <button
                    onClick={() => navigate('/appliances')}
                    className="group flex items-center gap-2 text-sm text-[#BDB5B1] hover:text-white transition-colors"
                  >
                    Appliance Maintenance

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>


                <li>
                  <button
                    onClick={() => navigate('/smart-assist')}
                    className="group flex items-center gap-2 text-sm text-[#BDB5B1] hover:text-white transition-colors"
                  >
                    Smart Assist & Reminders

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>


                <li>
                  <button
                    onClick={() => navigate('/settings')}
                    className="group flex items-center gap-2 text-sm text-[#BDB5B1] hover:text-white transition-colors"
                  >
                    Settings & Accounts

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>

              </ul>

            </div>


            {/* =================================================
                PLATFORM
            ================================================= */}

            <div className="space-y-5">

              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#F0C7B8]">
                Platform
              </h4>


              <ul className="space-y-2.5">

                <li>
                  <button
                    onClick={() => goToSection('features')}
                    className="group flex items-center gap-2 text-sm text-[#BDB5B1] hover:text-white transition-colors"
                  >
                    Features

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>


                <li>
                  <button
                    onClick={() => goToSection('ai-intelligence')}
                    className="group flex items-center gap-2 text-sm text-[#BDB5B1] hover:text-white transition-colors"
                  >
                    AI Assistant

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>


                <li>
                  <button
                    onClick={() => goToSection('how-it-works')}
                    className="group flex items-center gap-2 text-sm text-[#BDB5B1] hover:text-white transition-colors"
                  >
                    How It Works

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>


                <li>
                  <button
                    onClick={() => goToSection('security')}
                    className="group flex items-center gap-2 text-sm text-[#BDB5B1] hover:text-white transition-colors"
                  >
                    Security & Privacy

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>

              </ul>


              {/* Get Started Button */}

              <button
                onClick={() => navigate('/login')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#24211F] text-xs font-bold hover:bg-[#FFF3EE] transition-colors shadow-sm"
              >

                Get Started

                <ArrowRight className="w-3.5 h-3.5" />

              </button>

            </div>


            {/* =================================================
                TRUST & SECURITY
            ================================================= */}

            <div className="space-y-5">

              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#F0C7B8]">
                Trust & Security
              </h4>


              {/* Privacy */}

              <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 hover:bg-white/9 transition-colors">

                <div className="flex items-start gap-3">

                  <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">

                    <Lock className="w-4 h-4 text-[#A9DCC2]" />

                  </div>


                  <div>

                    <p className="text-xs font-bold text-white">
                      Privacy First
                    </p>

                    <p className="text-[11px] text-[#AAA29E] mt-1 leading-relaxed">
                      Your household information stays protected.
                    </p>

                  </div>

                </div>

              </div>


              {/* Security */}

              <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 hover:bg-white/9 transition-colors">

                <div className="flex items-start gap-3">

                  <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">

                    <ShieldCheck className="w-4 h-4 text-[#F0C7B8]" />

                  </div>


                  <div>

                    <p className="text-xs font-bold text-white">
                      Secure by Design
                    </p>

                    <p className="text-[11px] text-[#AAA29E] mt-1 leading-relaxed">
                      Built around secure household workflows.
                    </p>

                  </div>

                </div>

              </div>


              {/* Back to Top */}

              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#F0C7B8] hover:text-white transition-colors"
              >

                <ArrowUp className="w-3.5 h-3.5" />

                Back to top

              </button>

            </div>

          </div>

        </div>


        {/* ===================================================
            BOTTOM BAR
        =================================================== */}

        <div className="border-t border-white/10 py-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Copyright */}

            <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-[#8F8783] text-center sm:text-left">

              <span>
                © 2026 HomeOS. All rights reserved.
              </span>

              <span className="hidden sm:inline text-white/15">
                •
              </span>

              <span>
                A personal operating system for the modern household
              </span>

            </div>


            {/* Policies */}

            <div className="flex items-center gap-5 text-xs">

              <button
                className="text-[#8F8783] hover:text-white transition-colors"
              >
                Privacy
              </button>

              <button
                className="text-[#8F8783] hover:text-white transition-colors"
              >
                Terms
              </button>

              <button
                className="text-[#8F8783] hover:text-white transition-colors flex items-center gap-1.5"
              >

                <Mail className="w-3.5 h-3.5" />

                Contact

              </button>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}