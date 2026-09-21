import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useHomeOs } from '../context/HomeOsContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

import {
  ArrowRight,
  Play,
  Sparkles,
  LayoutDashboard,
  Wallet,
  FolderLock,
  Wrench,
  Bot,
  Settings,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  Lock,
  EyeOff,
  Database,
  Bell,
  Search,
  Volume2,
  FileUp,
  Home,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { navigate } = useHomeOs();

  /* =========================================================
     HERO VALUE POINTS
  ========================================================= */

  const heroValueProps = [
    {
      icon: Home,
      title: 'Organize Your Home',
      color: 'text-[#C96243]'
    },
    {
      icon: Clock,
      title: 'Save Time & Money',
      color: 'text-[#4FA77B]'
    },
    {
      icon: ShieldCheck,
      title: 'Stay Secure & Prepared',
      color: 'text-[#668BC4]'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Assistance',
      color: 'text-[#C96243]'
    }
  ];

  /* =========================================================
     HOUSEHOLD BENEFITS
     Added from older HomeOS landing page
  ========================================================= */

  const valuePoints = [
    {
      icon: Layers,
      title: 'Everything in one place',
      description:
        'Replace fragmented chats, scattered PDFs, and forgotten paper bills with one cohesive household operating system.'
    },
    {
      icon: Clock,
      title: 'Smarter reminders',
      description:
        'Proactive scheduling that anticipates bill due dates, warranty expiries, and seasonal home maintenance.'
    },
    {
      icon: TrendingUp,
      title: 'Financial visibility',
      description:
        'Real-time category budgets, utility trend detection, and recurring bill oversight in one transparent place.'
    },
    {
      icon: FolderLock,
      title: 'Organized documents',
      description:
        'Encrypted, tag-searchable vault for identity cards, deeds, diplomas, and important family records.'
    },
    {
      icon: Wrench,
      title: 'Appliance tracking',
      description:
        'Track running status, service countdowns, technician history, and maintenance schedules.'
    },
    {
      icon: Sparkles,
      title: 'AI-powered household insights',
      description:
        'Intelligent daily briefings and utility anomaly alerts that help keep your entire home running smoothly.'
    }
  ];

  /* =========================================================
     CORE MODULES
  ========================================================= */

  const coreModules = [
    {
      icon: Wallet,
      title: 'Finance Management',
      description:
        'Track expenses, manage bills and plan your savings with real-time clarity.',
      iconBg: 'bg-[#F4D8CC]',
      iconColor: 'text-[#C96243]',
      route: '/finance'
    },
    {
      icon: FolderLock,
      title: 'Document Vault',
      description:
        'Store important family documents securely in one encrypted location.',
      iconBg: 'bg-[#E9F0FA]',
      iconColor: 'text-[#668BC4]',
      route: '/documents'
    },
    {
      icon: Wrench,
      title: 'Appliance Maintenance',
      description:
        'Track service, get reminders and keep your appliances running smoothly.',
      iconBg: 'bg-[#FFF1D8]',
      iconColor: 'text-[#E7A84B]',
      route: '/appliances'
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description:
        'Get personalized suggestions and proactive reminders for your household.',
      iconBg: 'bg-[#F4D8CC]',
      iconColor: 'text-[#C96243]',
      route: '/smart-assist'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description:
        'Never miss important tasks, utility payments, or service appointments.',
      iconBg: 'bg-[#FBE6E6]',
      iconColor: 'text-[#D95C5C]',
      route: '/smart-assist'
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Private',
      description:
        'Your household information is protected with privacy-focused controls.',
      iconBg: 'bg-[#E4F3EB]',
      iconColor: 'text-[#4FA77B]',
      route: '/settings'
    }
  ];

  /* =========================================================
     AI INSIGHTS
     Added from older HomeOS landing page
  ========================================================= */

  const aiInsights = [
    {
      title: 'Utility Spending Alert',
      text: 'Utility spending increased this month.',
      meta: '8% higher than last month • Electricity is the largest driver',
      category: 'Finance',
      icon: TrendingUp
    },
    {
      title: 'Service Countdown',
      text: 'Your AC maintenance is approaching.',
      meta: 'Recommended service approaching • Due in 5 days',
      category: 'Appliance',
      icon: Wrench
    },
    {
      title: 'Payment Reminder',
      text: 'Your electricity bill is due tomorrow.',
      meta: '₹2,650 electricity payment • Auto-debit pending',
      category: 'Bills',
      icon: Zap
    },
    {
      title: 'Priority Schedule',
      text: 'You have 3 important tasks this week.',
      meta: 'AC service, document review, and household reminders',
      category: 'Reminders',
      icon: Clock
    }
  ];

  /* =========================================================
     HOW IT WORKS
  ========================================================= */

  const steps = [
    {
      step: '01',
      title: 'Connect your household',
      description:
        'Add family members with tailored roles, list your primary appliances, and initialize your monthly budget.'
    },
    {
      step: '02',
      title: 'Organize everything',
      description:
        'Deposit key family documents securely, schedule recurring bills, and set maintenance milestones.'
    },
    {
      step: '03',
      title: 'Let HomeOS assist you',
      description:
        'Receive proactive alerts before bills are due, maintenance recommendations, and daily home briefings.'
    }
  ];

  /* =========================================================
     SECURITY
  ========================================================= */

  const securityPoints = [
    {
      icon: Lock,
      title: 'Zero-Knowledge Vault',
      description:
        'Important household records are protected before they enter the secure document vault.'
    },
    {
      icon: EyeOff,
      title: 'Privacy Controls',
      description:
        'Your family records and household information remain protected with privacy-focused controls.'
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access',
      description:
        'Granular permissions allow household administrators to define viewing access per family member.'
    },
    {
      icon: Database,
      title: 'Household Backups',
      description:
        'Export and preserve complete household information for convenient backup and recovery.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F3] text-[#241D1A] flex flex-col selection:bg-[#F4D8CC] selection:text-[#241D1A]">

      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">

        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-[#F4D8CC]/40 rounded-full blur-[140px] pointer-events-none" />

        <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#FFF1D8]/50 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* HERO LEFT */}

            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8DDD6] shadow-sm text-xs font-bold tracking-widest uppercase text-[#716963]">

                <Sparkles className="w-3.5 h-3.5 text-[#C96243]" />

                <span>A SMARTER HOME. A BRIGHTER YOU.</span>

              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-[#241D1A] tracking-tight leading-[1.08]">

                Your Home. <br />

                <span className="font-serif italic font-normal text-[#C96243] block my-1">
                  One Intelligent
                </span>

                <span>System.</span>

              </h1>

              <p className="text-base sm:text-lg text-[#716963] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                HomeOS brings your finances, documents, appliances, reminders and
                everyday household management into one intelligent place.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/login')}
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full sm:w-auto shadow-md"
                >
                  Get Started
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() =>
                    document
                      .getElementById('features')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  icon={Play}
                  iconPosition="left"
                  className="w-full sm:w-auto border-[#E8DDD6]"
                >
                  Explore HomeOS
                </Button>

              </div>

              {/* HERO VALUE INDICATORS */}

              <div className="pt-6 border-t border-[#E8DDD6] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center lg:text-left">

                {heroValueProps.map((item, idx) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-center gap-2"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#E8DDD6] flex items-center justify-center shrink-0 shadow-sm">

                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />

                      </div>

                      <span className="text-xs font-semibold text-[#716963] leading-tight">
                        {item.title}
                      </span>

                    </div>
                  );
                })}

              </div>

            </div>


            {/* =================================================
                HERO DASHBOARD PREVIEW
            ================================================= */}

            <div className="lg:col-span-7 relative">

              <div className="relative mx-auto max-w-2xl lg:max-w-none">

                <div className="absolute -inset-2 bg-gradient-to-r from-[#C96243]/15 via-[#F4D8CC]/30 to-[#E7A84B]/15 rounded-3xl blur-2xl -z-10" />

                <div className="bg-white rounded-3xl border border-[#E8DDD6] shadow-homeos-lg p-3 sm:p-4">

                  <div className="bg-[#FBF7F3] rounded-2xl border border-[#E8DDD6] p-4 sm:p-5 space-y-4 overflow-hidden">

                    {/* TOP BAR */}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8DDD6]">

                      <div className="flex items-center gap-3">

                        <div className="w-8 h-8 rounded-lg bg-[#C96243] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          <Home className="w-4 h-4" />
                        </div>

                        <div>

                          <div className="flex items-center gap-1.5">

                            <span className="text-xs font-bold text-[#241D1A]">
                              Good Morning, Navya!
                            </span>

                            <span className="w-1.5 h-1.5 rounded-full bg-[#4FA77B]" />

                          </div>

                          <p className="text-[10px] text-[#716963]">
                            A calmer home for a brighter you.
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">

                        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#E8DDD6] text-[10px] text-[#9A908A]">

                          <Search className="w-3 h-3" />

                          <span>Search...</span>

                        </div>

                        <div className="w-7 h-7 rounded-lg bg-white border border-[#E8DDD6] flex items-center justify-center text-[#716963]">
                          <Bell className="w-3.5 h-3.5" />
                        </div>

                        <div className="w-7 h-7 rounded-lg bg-white border border-[#E8DDD6] flex items-center justify-center text-[#716963]">
                          <Volume2 className="w-3.5 h-3.5" />
                        </div>

                      </div>

                    </div>


                    {/* STAT CARDS */}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">

                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DDD6] shadow-sm">

                        <span className="text-[10px] text-[#716963] font-medium block">
                          Total Expenses
                        </span>

                        <span className="text-sm font-black text-[#241D1A]">
                          ₹12,450
                        </span>

                        <span className="text-[9px] text-[#4FA77B] font-semibold bg-[#E4F3EB] px-1.5 py-0.5 rounded inline-block mt-1">
                          +8% vs last week
                        </span>

                      </div>


                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DDD6] shadow-sm">

                        <span className="text-[10px] text-[#716963] font-medium block">
                          Upcoming Bills
                        </span>

                        <span className="text-sm font-black text-[#241D1A]">
                          3
                        </span>

                        <span className="text-[9px] text-[#D95C5C] font-semibold bg-[#FBE6E6] px-1.5 py-0.5 rounded inline-block mt-1">
                          1 Due today
                        </span>

                      </div>


                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DDD6] shadow-sm">

                        <span className="text-[10px] text-[#716963] font-medium block">
                          Appliances
                        </span>

                        <span className="text-sm font-black text-[#241D1A]">
                          5
                        </span>

                        <span className="text-[9px] text-[#4FA77B] font-semibold bg-[#E4F3EB] px-1.5 py-0.5 rounded inline-block mt-1">
                          1 Running 4 Ready
                        </span>

                      </div>


                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DDD6] shadow-sm">

                        <span className="text-[10px] text-[#716963] font-medium block">
                          Documents
                        </span>

                        <span className="text-sm font-black text-[#241D1A]">
                          24
                        </span>

                        <span className="text-[9px] text-[#668BC4] font-semibold bg-[#E9F0FA] px-1.5 py-0.5 rounded inline-block mt-1">
                          Securely stored
                        </span>

                      </div>

                    </div>


                    {/* MIDDLE */}

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">

                      <div className="sm:col-span-7 p-3 rounded-xl bg-white border border-[#E8DDD6] shadow-sm">

                        <div className="flex items-center justify-between mb-2">

                          <span className="text-xs font-bold text-[#241D1A]">
                            Monthly Expenses
                          </span>

                          <span className="text-[10px] font-bold text-[#4FA77B] bg-[#E4F3EB] px-1.5 py-0.5 rounded">
                            ₹12,450 • 2.8%
                          </span>

                        </div>

                        <div className="flex items-end justify-between h-20 pt-2 px-1">

                          {[
                            { m: 'Jan', h: '45%' },
                            { m: 'Feb', h: '60%' },
                            { m: 'Mar', h: '40%' },
                            { m: 'Apr', h: '75%' },
                            { m: 'May', h: '55%' },
                            { m: 'Jun', h: '88%' }
                          ].map((bar, i) => (

                            <div
                              key={i}
                              className="flex flex-col items-center gap-1"
                            >

                              <div className="w-5 bg-[#F8E7E0] rounded-t-sm flex items-end justify-center h-16">

                                <div
                                  className="w-full bg-[#C96243] rounded-t-sm"
                                  style={{ height: bar.h }}
                                />

                              </div>

                              <span className="text-[9px] text-[#9A908A]">
                                {bar.m}
                              </span>

                            </div>

                          ))}

                        </div>

                      </div>


                      {/* AI PREVIEW */}

                      <div className="sm:col-span-5 p-3 rounded-xl bg-gradient-to-br from-[#FFF9F6] to-[#F8E7E0]/40 border border-[#C96243]/25 shadow-sm flex flex-col justify-between">

                        <div>

                          <div className="flex items-center gap-1.5 text-[#C96243] text-xs font-bold mb-1">

                            <Bot className="w-3.5 h-3.5" />

                            <span>AI Assistant</span>

                          </div>

                          <p className="text-[11px] text-[#716963] leading-relaxed">
                            Need help planning your weekly chores? I can help you create a personalized schedule.
                          </p>

                        </div>

                        <button
                          onClick={() => navigate('/login')}
                          className="mt-2.5 w-full py-1.5 bg-[#C96243] hover:bg-[#AE4F35] text-white rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                        >
                          Ask Assistant →
                        </button>

                      </div>

                    </div>


                    {/* BOTTOM */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">

                      {/* RECENT ACTIVITY */}

                      <div className="p-3 rounded-xl bg-white border border-[#E8DDD6] shadow-sm space-y-2">

                        <div className="flex items-center justify-between text-xs font-bold text-[#241D1A]">

                          <span>Recent Activity</span>

                          <span className="text-[10px] text-[#9A908A] font-normal">
                            Household
                          </span>

                        </div>

                        <div className="space-y-1.5 text-[11px]">

                          <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#FBF7F3] border border-[#F0E7E2]">

                            <div className="flex items-center gap-2">

                              <Zap className="w-3 h-3 text-[#D95C5C]" />

                              <span className="text-[#241D1A] font-medium">
                                Electricity Bill
                              </span>

                            </div>

                            <span className="text-[10px] font-bold text-[#D95C5C]">
                              ₹2,650 Due
                            </span>

                          </div>


                          <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#FBF7F3] border border-[#F0E7E2]">

                            <div className="flex items-center gap-2">

                              <Wrench className="w-3 h-3 text-[#4FA77B]" />

                              <span className="text-[#241D1A] font-medium">
                                Washing Machine
                              </span>

                            </div>

                            <span className="text-[10px] text-[#716963]">
                              Serviced
                            </span>

                          </div>

                        </div>

                      </div>


                      {/* QUICK ACTIONS */}

                      <div className="p-3 rounded-xl bg-white border border-[#E8DDD6] shadow-sm space-y-2">

                        <span className="text-xs font-bold text-[#241D1A] block">
                          Quick Actions
                        </span>

                        <div className="grid grid-cols-4 gap-1.5 text-center">

                          {[
                            { label: 'Add Expense', icon: Wallet },
                            { label: 'Upload Doc', icon: FileUp },
                            { label: 'Set Reminder', icon: Bell },
                            { label: 'Log Service', icon: Wrench }
                          ].map((action, i) => {

                            const ActionIcon = action.icon;

                            return (
                              <button
                                key={i}
                                onClick={() => navigate('/login')}
                                className="p-1.5 rounded-lg bg-[#FBF7F3] hover:bg-[#F4D8CC]/40 border border-[#F0E7E2] flex flex-col items-center gap-1 transition-colors"
                              >

                                <ActionIcon className="w-3.5 h-3.5 text-[#C96243]" />

                                <span className="text-[9px] text-[#716963] leading-tight line-clamp-1">
                                  {action.label}
                                </span>

                              </button>
                            );

                          })}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                {/* QUOTE */}

                <div className="absolute -bottom-6 -left-4 bg-white p-3.5 rounded-2xl border border-[#E8DDD6] shadow-homeos-lg max-w-xs hidden md:block">

                  <p className="text-xs font-serif italic text-[#716963] leading-relaxed">
                    “A well-managed home is a happier home.”
                  </p>

                  <span className="text-[10px] font-bold text-[#C96243] uppercase tracking-wider block mt-1">
                    HomeOS Smart Living
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOUSEHOLD BENEFITS
      ===================================================== */}

      <section className="py-20 bg-[#FFF9F6] border-y border-[#E8DDD6]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <span className="text-xs font-bold uppercase tracking-widest text-[#C96243]">
              WHY HOMEOS
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241D1A] font-display tracking-tight mt-2">
              Everything your household needs, in one place.
            </h2>

            <p className="mt-4 text-[#716963] text-sm sm:text-base leading-relaxed">
              Designed to bring peace of mind to modern households with a unified
              system built around real family workflows.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {valuePoints.map((point, index) => {

              const Icon = point.icon;

              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white border border-[#E8DDD6] hover:border-[#C96243]/40 transition-all duration-200 hover:-translate-y-1 shadow-sm"
                >

                  <div className="w-11 h-11 rounded-xl bg-[#F8E7E0] border border-[#F4D8CC] flex items-center justify-center mb-4 text-[#C96243]">

                    <Icon className="w-5 h-5" />

                  </div>

                  <h3 className="text-base font-bold text-[#241D1A] mb-2">
                    {point.title}
                  </h3>

                  <p className="text-xs text-[#716963] leading-relaxed">
                    {point.description}
                  </p>

                </div>
              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          CORE MODULES
      ===================================================== */}

      <section id="features" className="py-20 bg-white border-t border-[#E8DDD6]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-14">

            <span className="text-xs font-bold uppercase tracking-widest text-[#C96243] block mb-2">
              EVERYTHING YOU NEED
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241D1A] font-display tracking-tight">
              A Complete Home Management Platform
            </h2>

            <p className="mt-3 text-[#716963] text-sm sm:text-base leading-relaxed">
              Powerful modules designed to make your household life simpler,
              smarter and stress-free.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {coreModules.map((module, index) => {

              const Icon = module.icon;

              return (
                <Card
                  key={index}
                  hoverEffect
                  className="p-6 bg-white border border-[#E8DDD6] flex flex-col justify-between"
                  onClick={() => navigate(module.route)}
                >

                  <div>

                    <div
                      className={`w-12 h-12 rounded-xl ${module.iconBg} ${module.iconColor} flex items-center justify-center mb-5 shadow-sm`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-base font-bold text-[#241D1A] mb-2">
                      {module.title}
                    </h3>

                    <p className="text-xs text-[#716963] leading-relaxed">
                      {module.description}
                    </p>

                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F0E7E2] flex items-center text-xs font-bold text-[#241D1A] group">

                    <span>Explore module</span>

                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#C96243] transition-transform group-hover:translate-x-1" />

                  </div>

                </Card>
              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          AI INTELLIGENCE
      ===================================================== */}

      <section
        id="ai-intelligence"
        className="py-20 bg-[#FFF9F6] text-[#241D1A] relative overflow-hidden border-t border-[#E8DDD6]"
      >

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#F4D8CC]/30 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8E7E0] border border-[#F4D8CC] text-[#AE4F35] text-xs font-bold mb-3">

              <Sparkles className="w-3.5 h-3.5 fill-[#C96243] text-[#C96243]" />

              <span>CONTEXT-AWARE HOME ENGINE</span>

            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241D1A] font-display tracking-tight">
              Your home, with intelligence built in.
            </h2>

            <p className="mt-3 text-[#716963] text-sm sm:text-base leading-relaxed">
              HomeOS connects spending, appliance cycles, reminders and documents
              to deliver concise, actionable household guidance.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {aiInsights.map((insight, idx) => {

              const Icon = insight.icon;

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-[#E8DDD6] hover:border-[#C96243]/40 transition-all duration-200 shadow-sm flex items-start gap-4"
                >

                  <div className="w-10 h-10 rounded-xl bg-[#C96243] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">

                    <Icon className="w-5 h-5" />

                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center justify-between gap-2 mb-1">

                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#AE4F35]">
                        {insight.category}
                      </span>

                      <span className="text-[10px] text-[#AE4F35] font-bold bg-[#F8E7E0] px-2 py-0.5 rounded border border-[#F4D8CC]">
                        ✦ Insight
                      </span>

                    </div>

                    <h4 className="text-sm font-bold text-[#241D1A] mb-1">
                      {insight.text}
                    </h4>

                    <p className="text-xs text-[#716963]">
                      {insight.meta}
                    </p>

                  </div>

                </div>
              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="py-20 bg-[#FBF7F3] border-t border-[#E8DDD6]"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <span className="text-xs font-bold uppercase tracking-widest text-[#C96243] block mb-2">
              SEAMLESS ONBOARDING
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241D1A] font-display tracking-tight">
              How It Works
            </h2>

            <p className="mt-3 text-[#716963] text-sm leading-relaxed">
              Getting started takes less than five minutes. Everything connects
              intelligently in one platform.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {steps.map((step, index) => (

              <div
                key={index}
                className="p-7 rounded-2xl bg-white border border-[#E8DDD6] hover:border-[#DEC9BE] transition-all shadow-sm space-y-3"
              >

                <span className="text-3xl font-extrabold text-[#C96243] font-mono block">
                  {step.step}
                </span>

                <h3 className="text-lg font-bold text-[#241D1A]">
                  {step.title}
                </h3>

                <p className="text-xs text-[#716963] leading-relaxed">
                  {step.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          SECURITY
      ===================================================== */}

      <section
        id="security"
        className="py-20 bg-white border-t border-[#E8DDD6]"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <span className="text-xs font-bold uppercase tracking-widest text-[#C96243] block mb-2">
              DATA PRIVACY & SOVEREIGNTY
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241D1A] font-display tracking-tight">
              Built for trust and privacy from day one.
            </h2>

            <p className="mt-3 text-[#716963] text-sm leading-relaxed">
              Household records represent your family's most sensitive
              information. HomeOS is designed around privacy-focused household
              workflows.
            </p>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {securityPoints.map((security, index) => {

              const Icon = security.icon;

              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-[#FFF9F6] border border-[#E8DDD6] shadow-sm space-y-3"
                >

                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DDD6] flex items-center justify-center text-[#4FA77B] shadow-sm">

                    <Icon className="w-5 h-5" />

                  </div>

                  <h4 className="text-sm font-bold text-[#241D1A]">
                    {security.title}
                  </h4>

                  <p className="text-xs text-[#716963] leading-relaxed">
                    {security.description}
                  </p>

                </div>
              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="py-20 bg-[#FBF7F3] border-t border-[#E8DDD6] text-center relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F4D8CC]/20 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8E7E0] border border-[#F4D8CC] text-[#AE4F35] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            SMARTER HOME MANAGEMENT
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-[#241D1A]">
            Take control of your household today.
          </h2>

          <p className="text-base text-[#716963] max-w-xl mx-auto leading-relaxed">
            «Everything important about your home, in one intelligent place.»
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto shadow-md"
            >
              Get Started Now
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto"
            >
              Sign In to Account
            </Button>

          </div>

        </div>

      </section>


      <Footer />

    </div>
  );
}