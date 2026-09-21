import React, { useState, useRef, useEffect } from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import {
  Sparkles,
  Bot,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Zap,
  Wrench,
  FolderLock,
  Wallet,
  AlertTriangle,
  ArrowRight,
  SunMedium,
  Check,
  RotateCcw,
  MessageSquareQuote,
  Sliders,
  ChevronRight
} from 'lucide-react';

export default function SmartAssistPage() {
  const {
    currentUser,
    reminders,
    toggleReminder,
    addReminder,
    deleteReminder,
    financeSummary,
    upcomingBills,
    appliances,
    documents,
    navigate,
    addToast
  } = useHomeOs();

  const [activeTab, setActiveTab] = useState('Today'); // 'Today' | 'This Week' | 'Upcoming'
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [smartSuggestionDismissed, setSmartSuggestionDismissed] = useState(false);

  const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'there';

  // Chat state
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hi ${firstName}! I’m keeping an eye on your household. What would you like to know?`,
      time: 'Just now',
      structuredCard: null
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // New reminder form
  const getDefaultReminderDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  };

  const [newReminder, setNewReminder] = useState({
    title: '',
    date: getDefaultReminderDate(),
    time: '10:00',
    repeat: 'Never',
    category: 'Finance',
    priority: 'Medium',
    period: 'Today',
    notes: ''
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Keep opening greeting dynamic if user name changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length > 0 && prev[0].id === 'msg-1') {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          text: `Hi ${firstName}! I’m keeping an eye on your household. What would you like to know?`
        };
        return updated;
      }
      return prev;
    });
  }, [firstName]);

  // Handle queries & suggested prompts
  const formatAmount = (amount) => {
    const value = Number(amount || 0);
    return `$${value.toFixed(2)}`;
  };

  const getActiveBills = () =>
    (upcomingBills || [])
      .filter(bill => String(bill.status || '').toLowerCase() !== 'paid')
      .slice(0, 5);

  const getServiceAppliances = () =>
    (appliances || []).filter(app =>
      String(app.status || '').toLowerCase() === 'needs service' ||
      ['critical', 'approaching'].includes(String(app.serviceUrgency || '').toLowerCase())
    );

  const getBriefingItems = () => {
    const items = [];

    (reminders || [])
      .filter(rem => rem.period === 'Today' && !rem.completed)
      .slice(0, 3)
      .forEach(rem => {
        items.push({
          title: rem.title,
          due: rem.dueDate || 'Today',
          priority: rem.priority || 'Medium'
        });
      });

    getActiveBills()
      .slice(0, Math.max(0, 3 - items.length))
      .forEach(bill => {
        items.push({
          title: `${bill.name || bill.title || 'Bill'} (${formatAmount(bill.amount)})`,
          due: bill.dueDate || bill.status || 'Upcoming',
          priority: String(bill.status || '').toLowerCase().includes('overdue') ? 'High' : 'Medium'
        });
      });

    getServiceAppliances()
      .slice(0, Math.max(0, 3 - items.length))
      .forEach(app => {
        items.push({
          title: `${app.name} maintenance`,
          due: app.nextService || app.serviceUrgency || 'Service required',
          priority: String(app.serviceUrgency || '').toLowerCase() === 'critical' ? 'High' : 'Medium'
        });
      });

    return items.slice(0, 3);
  };

  const getBriefingSummary = () => {
    const todayReminders = (reminders || []).filter(
      rem => rem.period === 'Today' && !rem.completed
    ).length;
    const activeBills = getActiveBills();
    const serviceCount = getServiceAppliances().length;

    const parts = [];
    if (todayReminders > 0) {
      parts.push(`${todayReminders} reminder${todayReminders === 1 ? '' : 's'} today`);
    }
    if (activeBills.length > 0) {
      parts.push(`${activeBills.length} bill${activeBills.length === 1 ? '' : 's'} to monitor`);
    }
    if (serviceCount > 0) {
      parts.push(`${serviceCount} appliance${serviceCount === 1 ? '' : 's'} need${serviceCount === 1 ? 's' : ''} attention`);
    }

    return parts.length
      ? `You currently have ${parts.join(', ')}.`
      : 'Everything in your household is currently up to date.';
  };

  // Keep AI responses connected to live context data instead of demo values.
  const handleSendQuery = (userText) => {
    const query = userText || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      time: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = generateAiResponse(query);
      setMessages(prev => [...prev, aiReply]);
      setIsTyping(false);
    }, 550);
  };

  const generateAiResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Finances / Spending
    if (q.includes('spend') || q.includes('financ') || q.includes('money') || q.includes('budget') || q.includes('how much')) {
      const spendingIncrease = Number(financeSummary?.spendingIncrease || 0);

      return {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: 'Here is your current financial status:',
        time: 'Just now',
        structuredCard: {
          type: 'finance',
          title: 'Household Budget',
          stats: [
            { label: 'Monthly Outflow', value: formatAmount(financeSummary?.monthlyExpenses) },
            { label: 'Total Inflow', value: formatAmount(financeSummary?.monthlyIncome) },
            { label: 'Savings Buffer', value: formatAmount(financeSummary?.savings) }
          ],
          note: spendingIncrease
            ? `Spending is ${spendingIncrease}% ${spendingIncrease >= 0 ? 'higher' : 'lower'} than the comparison period.`
            : 'No spending trend is currently available.',
          actionText: 'View Finance Management',
          actionRoute: '/finance'
        }
      };
    }

    // 2. Bills / Due this week / Upcoming
    if (q.includes('bill') || q.includes('due') || q.includes('pay') || q.includes('what’s due') || q.includes("what's due")) {
      const bills = getActiveBills();

      return {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: bills.length
          ? `${bills.length} active bill${bills.length === 1 ? ' needs' : 's need'} your attention:`
          : 'There are no unpaid bills currently recorded.',
        time: 'Just now',
        structuredCard: {
          type: 'bills',
          title: 'Current Bills',
          items: bills.map(bill => ({
            title: `${bill.name || bill.title || 'Bill'} (${formatAmount(bill.amount)})`,
            due: bill.dueDate || bill.status || 'Upcoming',
            urgent: String(bill.status || '').toLowerCase().includes('overdue') ||
              String(bill.status || '').toLowerCase().includes('tomorrow')
          })),
          actionText: 'View Finance Management',
          actionRoute: '/finance'
        }
      };
    }

    // 3. Appliances / maintenance
    if (q.includes('ac') || q.includes('appliance') || q.includes('maintenance') || q.includes('service') || q.includes('purifier') || q.includes('filter')) {
      const applianceItems = (appliances || []).slice(0, 5);

      return {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: applianceItems.length
          ? 'Here is the current operational health of your household devices:'
          : 'No appliances are currently recorded.',
        time: 'Just now',
        structuredCard: {
          type: 'appliances',
          title: 'Appliance Status',
          items: applianceItems.map(app => ({
            title: app.name,
            status: app.status || 'Unknown',
            note: app.nextService
              ? `Next service: ${app.nextService}`
              : app.serviceUrgency || 'No service schedule recorded'
          })),
          actionText: 'View Appliance Dashboard',
          actionRoute: '/appliances'
        }
      };
    }

    // 4. Documents / Find documents / Passport
    if (q.includes('document') || q.includes('passport') || q.includes('certificate') || q.includes('vault') || q.includes('deed')) {
      return {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: `Found ${documents.length} record${documents.length === 1 ? '' : 's'} in the vault. Here are the most recent:`,
        time: 'Just now',
        structuredCard: {
          type: 'documents',
          title: 'Vault Records',
          items: documents.slice(0, 3).map(d => ({
            title: d.name,
            owner: d.owner,
            meta: `${d.category || 'Document'} • ${d.format || d.fileType || 'File'}`
          })),
          actionText: 'Open Document Vault',
          actionRoute: '/documents'
        }
      };
    }

    // 5. Briefing / What should I take care of today?
    if (q.includes('today') || q.includes('briefing') || q.includes('take care') || q.includes('routine')) {
      const briefingItems = getBriefingItems();

      return {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: getBriefingSummary(),
        time: 'Just now',
        structuredCard: {
          type: 'briefing',
          title: "Today's Household Priorities",
          items: briefingItems,
          actionText: 'Manage All Reminders',
          actionRoute: '/smart-assist'
        }
      };
    }

    // Fallback response with live household data
    const activeBills = getActiveBills();
    const serviceApps = getServiceAppliances();

    const overviewItems = [
      ...activeBills.slice(0, 2).map(bill => ({
        title: bill.name || bill.title || 'Bill',
        due: `${bill.dueDate || bill.status || 'Upcoming'} (${formatAmount(bill.amount)})`
      })),
      ...serviceApps.slice(0, 1).map(app => ({
        title: app.name,
        due: `${app.status || 'Needs attention'}${app.nextService ? ` • ${app.nextService}` : ''}`
      })),
      ...(documents || []).slice(0, 1).map(doc => ({
        title: doc.name,
        due: 'Available in Document Vault'
      }))
    ].slice(0, 3);

    return {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: 'I’m tracking your live finances, bills, appliance service, reminders, and vault documents. Here’s a quick overview:',
      time: 'Just now',
      structuredCard: {
        type: 'overview',
        title: 'Household Summary',
        items: overviewItems,
        actionText: 'Explore Dashboard',
        actionRoute: '/dashboard'
      }
    };
  };

  const handleAddReminderSubmit = async (e) => {
    e.preventDefault();
    if (!newReminder.title.trim()) return;

    // Send a real ISO date/time to the backend.
    // The old UI sent values such as "Tomorrow, 10:00 AM",
    // which MongoDB cannot store as a Date.
    const dueDate = new Date(`${newReminder.date}T${newReminder.time}`);

    if (Number.isNaN(dueDate.getTime())) {
      addToast({
        title: 'Reminder Failed',
        message: 'Please select a valid date and time.',
        type: 'error'
      });
      return;
    }

    try {
      await addReminder({
        title: newReminder.title.trim(),
        period: newReminder.period,
        dueDate: dueDate.toISOString(),
        category: newReminder.category,
        priority: newReminder.priority,
        notes: newReminder.notes
      });

      setNewReminder({
        title: '',
        date: getDefaultReminderDate(),
        time: '10:00',
        repeat: 'Never',
        category: 'Finance',
        priority: 'Medium',
        period: 'Today',
        notes: ''
      });
      setIsAddReminderOpen(false);
    } catch {
      // addReminder already shows the backend error toast.
    }
  };

  const filteredReminders = reminders.filter(r => r.period === activeTab);

  return (
    <div className="space-y-7 animate-fadeIn">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#241D1A] tracking-tight font-sans flex items-center gap-2">
            <span>Smart Assist</span>
            <span className="text-[#C96243]">✦</span>
          </h2>
          <p className="text-sm text-[#716963] mt-1">
            Your intelligent companion for managing everyday life at home.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSendQuery("Give me today's briefing")}
            icon={SunMedium}
          >
            Today’s Briefing
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddReminderOpen(true)}
            icon={Plus}
            className="shadow-homeos-sm"
          >
            Add Reminder
          </Button>
        </div>
      </div>

      {/* 2. Daily Home Briefing Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFF9F6] border border-[#F4D8CC] shadow-homeos-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C96243]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-[#F8E7E0] border border-[#F4D8CC] text-[#C96243] flex items-center justify-center shrink-0 mt-0.5">
            <SunMedium className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#241D1A] font-sans">Daily Home Briefing</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8E7E0] text-[#C96243] border border-[#F4D8CC]">
                Morning Report
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#716963] leading-relaxed max-w-3xl">
              «{getBriefingSummary()}»
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0 self-start md:self-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSendQuery("What should I take care of today?")}
            icon={ArrowRight}
            iconPosition="right"
          >
            View Priorities
          </Button>
        </div>
      </div>

      {/* 3. Smart Proactive Suggestion Card */}
      {(() => {
        const serviceApps = getServiceAppliances();
        const suggestedApp = serviceApps[0];

        if (smartSuggestionDismissed || !suggestedApp) return null;

        return (
          <div className="p-4 rounded-2xl bg-white border border-[#E8DDD6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-fadeIn shadow-homeos-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F8E7E0] border border-[#F4D8CC] text-[#C96243] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[#241D1A]">Smart Maintenance Reminder</p>
                <p className="text-[#716963] mt-0.5">
                  HomeOS noticed that {suggestedApp.name} needs attention
                  {suggestedApp.nextService ? ` (${suggestedApp.nextService})` : ''}. Would you like to create a reminder?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                onClick={async () => {
                  let maintenanceDate = new Date();
                  maintenanceDate.setDate(maintenanceDate.getDate() + 7);

                  if (suggestedApp.nextService) {
                    const parsedServiceDate = new Date(suggestedApp.nextService);
                    if (!Number.isNaN(parsedServiceDate.getTime())) {
                      maintenanceDate = parsedServiceDate;
                    }
                  }

                  try {
                    await addReminder({
                      title: `${suggestedApp.name} maintenance`,
                      period: 'Upcoming',
                      dueDate: maintenanceDate.toISOString(),
                      category: 'Appliances',
                      priority: String(suggestedApp.serviceUrgency || '').toLowerCase() === 'critical' ? 'High' : 'Medium',
                      notes: `Created from Smart Assist for ${suggestedApp.name}`
                    });

                    addToast({
                      title: 'Smart Reminder Set',
                      message: `Reminder created for ${suggestedApp.name}`,
                      type: 'success'
                    });
                    setSmartSuggestionDismissed(true);
                  } catch {
                    // addReminder already shows the failure toast.
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C96243] hover:bg-[#AE4F35] text-white transition-colors shadow-homeos-sm cursor-pointer"
              >
                Remind Me
              </button>
              <button
                onClick={() => setSmartSuggestionDismissed(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#716963] hover:text-[#241D1A] hover:bg-[#FBF7F3] transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        );
      })()}

      {/* 4. Dual Section Layout: AI Conversation (7 cols) + Household Reminders (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Large Conversational AI Interface (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="rounded-2xl bg-white border border-[#E8DDD6] shadow-homeos-sm flex flex-col h-[640px] overflow-hidden">
            
            {/* AI Title Bar */}
            <div className="px-5 py-4 bg-[#FFF9F6] border-b border-[#E8DDD6] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F8E7E0] border border-[#F4D8CC] text-[#C96243] flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#241D1A] font-sans flex items-center gap-1.5">
                    <span>HomeOS Intelligence</span>
                    <span className="text-[#C96243]">✦</span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#716963]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4FA77B] animate-pulse"></span>
                    <span>Connected to household telemetry</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-[#4FA77B] bg-[#E4F3EB] px-2 py-0.5 rounded border border-[#4FA77B]/30 font-semibold">
                LIVE AGENT
              </span>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FBF7F3]">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-[#F8E7E0] border border-[#F4D8CC] text-[#C96243] flex items-center justify-center shrink-0 mt-1">
                        <Sparkles className="w-3.5 h-3.5 fill-[#C96243]" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-2`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#C96243] text-white font-semibold rounded-tr-none shadow-homeos-sm'
                            : 'bg-white text-[#241D1A] border border-[#E8DDD6] rounded-tl-none shadow-homeos-sm'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>

                      {/* Structured Response Card */}
                      {msg.structuredCard && (
                        <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] shadow-homeos-sm text-left space-y-3 mt-2 text-[#241D1A]">
                          <div className="flex items-center justify-between pb-2 border-b border-[#E8DDD6]">
                            <h4 className="text-xs font-bold text-[#241D1A] tracking-wide">
                              {msg.structuredCard.title}
                            </h4>
                            <span className="text-[10px] text-[#4FA77B] font-bold">
                              Verified
                            </span>
                          </div>

                          {/* Numeric Stats */}
                          {msg.structuredCard.stats && (
                            <div className="grid grid-cols-3 gap-2">
                              {msg.structuredCard.stats.map((s, idx) => (
                                <div key={idx} className="p-2 rounded-lg bg-white border border-[#E8DDD6]">
                                  <span className="text-[10px] text-[#716963] block">{s.label}</span>
                                  <span className="text-xs font-bold text-[#241D1A] block mt-0.5">{s.value}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* List of items */}
                          {msg.structuredCard.items && (
                            <div className="space-y-1.5">
                              {msg.structuredCard.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded-lg bg-white border border-[#E8DDD6] flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <p className="font-semibold text-[#241D1A]">{it.title}</p>
                                    {it.note && <p className="text-[10px] text-[#716963]">{it.note}</p>}
                                    {it.meta && <p className="text-[10px] text-[#9A908A]">{it.meta}</p>}
                                  </div>
                                  {it.due && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      it.urgent ? 'bg-[#FBE6E6] text-[#D95C5C]' : 'bg-[#E4F3EB] text-[#4FA77B]'
                                    }`}>
                                      {it.due}
                                    </span>
                                  )}
                                  {it.status && (
                                    <Badge
                                      variant={it.status === 'Running' ? 'running' : 'service'}
                                      size="sm"
                                    >
                                      {it.status}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Footer Action Button */}
                          {msg.structuredCard.actionText && (
                            <div className="pt-2 border-t border-[#E8DDD6] flex justify-end">
                              <button
                                onClick={() => navigate(msg.structuredCard.actionRoute)}
                                className="text-xs font-bold text-[#C96243] hover:text-[#AE4F35] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>{msg.structuredCard.actionText}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <span className="text-[10px] text-[#9A908A] px-1 block">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#716963]">
                  <div className="w-7 h-7 rounded-lg bg-[#F8E7E0] text-[#C96243] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span>HomeOS is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts & Chat Input */}
            <div className="p-4 bg-[#FFF9F6] border-t border-[#E8DDD6] space-y-3">
              {/* Horizontal scroll suggested chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {[
                  "Review my finances",
                  "What’s due this week?",
                  "Check appliance maintenance",
                  "Show important documents",
                  "Give me today’s briefing"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(prompt)}
                    className="px-3 py-1 rounded-full bg-white border border-[#E8DDD6] text-[11px] font-semibold text-[#716963] hover:text-[#241D1A] hover:border-[#C96243] transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-homeos-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendQuery();
                  }}
                  placeholder="Ask HomeOS anything about your household..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-white border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
                />
                <button
                  onClick={() => handleSendQuery()}
                  disabled={!inputQuery.trim()}
                  className="p-2.5 rounded-xl bg-[#C96243] hover:bg-[#AE4F35] text-white disabled:opacity-40 transition-colors shadow-homeos-sm cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Household Reminders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card padding="normal" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD6]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C96243]" />
                <h3 className="text-base font-bold text-[#241D1A] font-sans">Household Reminders</h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddReminderOpen(true)}
                icon={Plus}
              >
                New
              </Button>
            </div>

            {/* Period Filter Tabs (Today | This Week | Upcoming) */}
            <div className="flex rounded-xl bg-[#FBF7F3] p-1 border border-[#E8DDD6]">
              {['Today', 'This Week', 'Upcoming'].map((tab) => {
                const count = reminders.filter(r => r.period === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === tab
                        ? 'bg-[#C96243] text-white shadow-sm'
                        : 'text-[#716963] hover:text-[#241D1A]'
                    }`}
                  >
                    <span>{tab}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === tab ? 'bg-white/20 text-white' : 'bg-black/5 text-[#716963]'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Reminder Items List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredReminders.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#716963] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#4FA77B] mx-auto opacity-80" />
                  <p className="font-semibold text-[#241D1A]">No tasks scheduled for {activeTab.toLowerCase()}.</p>
                  <p className="text-[11px] text-[#9A908A]">Everything in this period is up to date.</p>
                </div>
              ) : (
                filteredReminders.map((rem) => {
                  const isDone = rem.completed;
                  return (
                    <div
                      key={rem.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-[#FBF7F3] border-[#E8DDD6] opacity-60'
                          : 'bg-white border-[#E8DDD6] hover:border-[#C96243]/50 shadow-homeos-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleReminder(rem.id)}
                          className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition-colors border cursor-pointer ${
                            isDone
                              ? 'bg-[#4FA77B] border-[#4FA77B] text-white'
                              : 'border-[#E8DDD6] hover:border-[#C96243] text-transparent'
                          }`}
                          aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-xs font-bold ${isDone ? 'line-through text-[#9A908A]' : 'text-[#241D1A]'}`}>
                              {rem.title}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rem.priority === 'High'
                                ? 'bg-[#FBE6E6] text-[#D95C5C] border border-[#D95C5C]/30'
                                : 'bg-[#F8E7E0] text-[#C96243] border border-[#F4D8CC]'
                            }`}>
                              {rem.priority}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#716963] mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#9A908A]" />
                              {rem.dueDate}
                            </span>
                            <span>•</span>
                            <span>{rem.category}</span>
                          </div>

                          {rem.notes && (
                            <p className="text-[11px] text-[#716963] mt-1.5 pt-1.5 border-t border-[#E8DDD6]">
                              {rem.notes}
                            </p>
                          )}
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => deleteReminder(rem.id)}
                          className="p-1 text-[#9A908A] hover:text-[#D95C5C] rounded transition-colors cursor-pointer"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Helper Text */}
            <div className="pt-2 border-t border-[#E8DDD6] text-[11px] text-[#716963] flex items-center justify-between">
              <span>Automated cross-module sync</span>
              <span className="text-[#4FA77B] font-medium">AI Monitored</span>
            </div>
          </Card>
        </div>

      </div>

      {/* 5. Add Reminder Modal */}
      <Modal
        isOpen={isAddReminderOpen}
        onClose={() => setIsAddReminderOpen(false)}
        title="Create Household Reminder"
        subtitle="Schedule a task, deadline, or maintenance checkpoint"
      >
        <form onSubmit={handleAddReminderSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
              Reminder Title *
            </label>
            <input
              type="text"
              required
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              placeholder="e.g. Pay electricity bill, Schedule AC service, Renew insurance"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Target Period
              </label>
              <select
                value={newReminder.period}
                onChange={(e) => setNewReminder({ ...newReminder, period: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none focus:border-[#C96243]"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Priority
              </label>
              <select
                value={newReminder.priority}
                onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none focus:border-[#C96243]"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Date / Day
              </label>
              <input
                type="date"
                required
                value={newReminder.date}
                onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Time
              </label>
              <input
                type="time"
                required
                value={newReminder.time}
                onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Category
              </label>
              <select
                value={newReminder.category}
                onChange={(e) => setNewReminder({ ...newReminder, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none focus:border-[#C96243]"
              >
                <option value="Finance">Finance</option>
                <option value="Appliances">Appliances</option>
                <option value="Documents">Documents</option>
                <option value="Household">Household</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Repeat Schedule
              </label>
              <select
                value={newReminder.repeat}
                onChange={(e) => setNewReminder({ ...newReminder, repeat: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none focus:border-[#C96243]"
              >
                <option value="Never">Does not repeat</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={newReminder.notes}
              onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
              placeholder="e.g. Account number, technician contact, policy link"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none placeholder:text-[#9A908A]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8DDD6]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddReminderOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
            >
              Create Reminder
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
