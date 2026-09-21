import React from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import AIInsightCard from '../../components/ui/AIInsightCard';
import {
  Wallet,
  Clock,
  FolderLock,
  Wrench,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Bot,
  Activity,
  Calendar,
  Zap,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const {
    currentUser,
    navigate,
    financeSummary,
    upcomingBills,
    documents,
    appliances,
    activityStream
  } = useHomeOs();

  const runningAppliancesCount = appliances.filter(a => a.status === 'Running').length;
  const needsServiceCount = appliances.filter(a => a.status === 'Needs Service').length;

  const currentMonth = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const totalUpcomingBills = upcomingBills.reduce(
    (total, bill) => total + Number(bill.amount || 0),
    0
  );

  const nextBill = upcomingBills[0] || null;

  const savingsRate =
    financeSummary.monthlyIncome > 0
      ? Math.max(
          0,
          Math.round(
            (financeSummary.savings / financeSummary.monthlyIncome) * 100
          )
        )
      : 0;

  const expenseRate =
    financeSummary.monthlyIncome > 0
      ? Math.min(
          100,
          Math.round(
            (financeSummary.monthlyExpenses / financeSummary.monthlyIncome) * 100
          )
        )
      : 0;

  const budgetProgress =
    financeSummary.monthlyBudget > 0
      ? Math.min(
          100,
          Math.round(
            (financeSummary.monthlyExpenses / financeSummary.monthlyBudget) * 100
          )
        )
      : 0;

  const budgetRemaining = Math.max(
    0,
    Number(financeSummary.monthlyBudget || 0) -
      Number(financeSummary.monthlyExpenses || 0)
  );

  const averageApplianceHealth =
    appliances.length > 0
      ? Math.round(
          appliances.reduce(
            (sum, appliance) => sum + Number(appliance.healthPercent || 0),
            0
          ) / appliances.length
        )
      : 0;

  const handleQuickAction = (actionText) => {
    if (actionText.includes('spending')) {
      navigate('/finance');
    } else if (actionText.includes('maintenance')) {
      navigate('/appliances');
    } else if (actionText.includes('document')) {
      navigate('/documents');
    } else if (actionText.includes('reminders')) {
      navigate('/smart-assist');
    } else {
      navigate('/smart-assist');
    }
  };

  const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'there';

  return (
    <div className="space-y-7 animate-fadeIn">
      
      {/* 1. Header Banner with Dynamic Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#241D1A] tracking-tight font-display">
            Good morning, {firstName} 👋
          </h2>
          <p className="text-sm text-[#716963] mt-1">
            Here’s what’s happening around your home today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/smart-assist')}
            icon={Bot}
          >
            Ask HomeOS
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/finance')}
            icon={Wallet}
          >
            Manage Finance
          </Button>
        </div>
      </div>

      {/* 2. Household Overview (4 Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Monthly Expenses */}
        <Card hoverEffect padding="normal" onClick={() => navigate('/finance')} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#716963]">
              Monthly Expenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F4D8CC] border border-[#C96243]/25 flex items-center justify-center text-[#C96243] shadow-xs">
              <Wallet className="w-4 h-4 text-[#C96243]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#241D1A] tracking-tight">
              ${financeSummary.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center text-[#E7A84B] font-bold">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                +{financeSummary.spendingIncrease}%
              </span>
              <span className="text-[#9A908A]">vs last month</span>
            </div>
          </div>
          <div className="pt-2 text-[11px] text-[#716963] flex items-center justify-between border-t border-[#F0E7E2]">
            <span>Budget: {money(financeSummary.monthlyBudget)}</span>
            <span className={`font-semibold ${
              financeSummary.monthlyBudget > 0
                ? financeSummary.monthlyExpenses <= financeSummary.monthlyBudget
                  ? 'text-[#4FA77B]'
                  : 'text-[#D95C5C]'
                : 'text-[#9A908A]'
            }`}>
              {financeSummary.monthlyBudget > 0
                ? financeSummary.monthlyExpenses <= financeSummary.monthlyBudget
                  ? 'Within Budget'
                  : 'Over Budget'
                : 'No Budget Set'}
            </span>
          </div>
        </Card>

        {/* Upcoming Bills */}
        <Card hoverEffect padding="normal" onClick={() => navigate('/finance')} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#716963]">
              Upcoming Bills
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FFF1D8] border border-[#E7A84B]/25 flex items-center justify-center text-[#E7A84B] shadow-xs">
              <Clock className="w-4 h-4 text-[#E7A84B]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#241D1A] tracking-tight">
              {upcomingBills.length} Active
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#D95C5C] font-bold">
              {nextBill ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#D95C5C] animate-pulse"></span>
                  <span>{nextBill.name} • {nextBill.dueDate}</span>
                </>
              ) : (
                <span className="text-[#9A908A] font-medium">No upcoming bills</span>
              )}
            </div>
          </div>
          <div className="pt-2 text-[11px] text-[#716963] flex items-center justify-between border-t border-[#F0E7E2]">
            <span>Total: {money(totalUpcomingBills)}</span>
            <span className="text-[#C96243] font-semibold">Review →</span>
          </div>
        </Card>

        {/* Documents */}
        <Card hoverEffect padding="normal" onClick={() => navigate('/documents')} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#716963]">
              Document Vault
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E9F0FA] border border-[#668BC4]/25 flex items-center justify-center text-[#668BC4] shadow-xs">
              <FolderLock className="w-4 h-4 text-[#668BC4]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#241D1A] tracking-tight">
              {documents.length} Files
            </div>
            <div className="mt-1 text-xs text-[#716963]">
              <span>Encrypted personal & family vault</span>
            </div>
          </div>
          <div className="pt-2 text-[11px] text-[#716963] flex items-center justify-between border-t border-[#F0E7E2]">
            <span>{documents.length > 0 ? `Recent: ${documents[0].name}` : "No documents yet"}</span>
            <span className="text-[#C96243] font-semibold">Open →</span>
          </div>
        </Card>

        {/* Appliances */}
        <Card hoverEffect padding="normal" onClick={() => navigate('/appliances')} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#716963]">
              Appliances
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E4F3EB] border border-[#4FA77B]/25 flex items-center justify-center text-[#4FA77B] shadow-xs">
              <Wrench className="w-4 h-4 text-[#4FA77B]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#241D1A] tracking-tight">
              {runningAppliancesCount} of {appliances.length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#E7A84B] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#E7A84B]"></span>
              <span>{needsServiceCount > 0 ? `${needsServiceCount} Needs Service` : "All appliances are healthy"}</span>
            </div>
          </div>
          <div className="pt-2 text-[11px] text-[#716963] flex items-center justify-between border-t border-[#F0E7E2]">
            <span>Overall Health: {averageApplianceHealth}%</span>
            <span className="text-[#C96243] font-semibold">Inspect →</span>
          </div>
        </Card>
      </div>

      {/* 3. Prominent HomeOS Intelligence Card */}
      <AIInsightCard
        title="HomeOS Intelligence"
        badge="Household Overview"
        description={
          upcomingBills.length > 0 || financeSummary.monthlyExpenses > 0
            ? `Your dashboard currently shows ${upcomingBills.length} upcoming bill${upcomingBills.length === 1 ? '' : 's'} and ${money(financeSummary.monthlyExpenses)} in monthly expenses.`
            : "Your household financial activity is ready to be recorded. Add transactions or bills to build your live overview."
        }
        recommendation={
          upcomingBills.length > 0
            ? `Next bill: ${upcomingBills[0].name} — ${upcomingBills[0].dueDate}.`
            : "Add your first bill or transaction to keep HomeOS up to date."
        }
        actionText="View Finance"
        onAction={() => navigate('/finance')}
      />

      {/* 4. Two-Column Mid Section: Upcoming Schedule & Finance Overview Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upcoming Schedule (7 cols) */}
        <div className="lg:col-span-7">
          <Card padding="normal" className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0E7E2]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C96243]" />
                  <h3 className="text-base font-bold text-[#241D1A] font-display">Upcoming Schedule</h3>
                </div>
                <span className="text-xs text-[#716963] font-medium">Next 30 Days</span>
              </div>

              <div className="space-y-3">
                {upcomingBills.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm font-semibold text-[#716963]">
                      No upcoming bills scheduled
                    </p>
                    <p className="text-xs text-[#9A908A] mt-1">
                      Add a bill in Finance Management to see it here.
                    </p>
                  </div>
                ) : (
                  upcomingBills.slice(0, 4).map((bill) => (
                    <div
                      key={bill.id}
                      className="p-3.5 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-between hover:border-[#C96243]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#F4D8CC] border border-[#C96243]/30 flex items-center justify-center text-[#C96243] font-bold shrink-0">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#241D1A] truncate">
                            {bill.name} — {money(bill.amount)}
                          </p>
                          <p className="text-[11px] text-[#716963] truncate">
                            {bill.provider || bill.category || 'Household Bill'}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          String(bill.dueDate || '').toLowerCase().includes('tomorrow')
                            ? 'urgent'
                            : 'warning'
                        }
                        dot
                      >
                        {bill.dueDate || 'Upcoming'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#F0E7E2] flex items-center justify-between text-xs">
              <span className="text-[#716963]">{upcomingBills.length} upcoming bill{upcomingBills.length === 1 ? "" : "s"} scheduled</span>
              <button
                onClick={() => navigate('/smart-assist')}
                className="font-bold text-[#C96243] hover:text-[#AE4F35] flex items-center gap-1 transition-colors"
              >
                <span>View Full Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>

        {/* Finance Overview Chart (5 cols) */}
        <div className="lg:col-span-5">
          <Card padding="normal" className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0E7E2]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#C96243]" />
                  <h3 className="text-base font-bold text-[#241D1A] font-display">Finance Overview</h3>
                </div>
                <span className="text-xs font-bold text-[#C96243] bg-[#F4D8CC] px-2.5 py-0.5 rounded-full border border-[#C96243]/30">
                  {currentMonth}
                </span>
              </div>

              {/* Stat breakdown pills */}
              <div className="grid grid-cols-3 gap-2 text-center mb-6">
                <div className="p-2.5 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">
                  <span className="text-[10px] text-[#716963] font-bold block uppercase">Income</span>
                  <span className="text-xs font-extrabold text-[#241D1A] mt-0.5 block">
                    {money(financeSummary.monthlyIncome)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">
                  <span className="text-[10px] text-[#716963] font-bold block uppercase">Expenses</span>
                  <span className="text-xs font-extrabold text-[#C96243] mt-0.5 block">
                    {money(financeSummary.monthlyExpenses)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">
                  <span className="text-[10px] text-[#716963] font-bold block uppercase">Savings</span>
                  <span className="text-xs font-extrabold text-[#4FA77B] mt-0.5 block">
                    {money(financeSummary.savings)}
                  </span>
                </div>
              </div>

              {/* Visual Restrained Palette Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#716963] font-semibold">
                  <span>Monthly Allocation</span>
                  <span>Expenses: {expenseRate}% • Savings: {savingsRate}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#F0E7E2] flex overflow-hidden p-0.5 border border-[#E8DDD6]">
                  <div
                    className="h-full rounded-l-full bg-[#C96243]"
                    style={{ width: `${expenseRate}%` }}
                    title={`Expenses: ${money(financeSummary.monthlyExpenses)}`}
                  />
                  <div
                    className="h-full rounded-r-full bg-[#4FA77B]"
                    style={{ width: `${savingsRate}%` }}
                    title={`Savings: ${money(financeSummary.savings)}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#716963] pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#C96243]"></span>
                    <span>Expenses ({money(financeSummary.monthlyExpenses)})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#4FA77B]"></span>
                    <span>Saved ({money(financeSummary.savings)})</span>
                  </span>
                </div>
              </div>

              {/* Monthly Budget bar */}
              <div className="mt-5 p-3.5 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#241D1A]">Household Monthly Budget</span>
                  <span className="font-mono text-[#241D1A] font-bold">{money(financeSummary.monthlyExpenses)} / {money(financeSummary.monthlyBudget)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E8DDD6] overflow-hidden">
                  <div className="h-full bg-[#C96243] rounded-full" style={{ width: `${budgetProgress}%` }}></div>
                </div>
                <p className="text-[10px] text-[#716963] text-right">
                  {financeSummary.monthlyBudget > 0 ? `${money(budgetRemaining)} remaining budget` : "No monthly budget configured"}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0E7E2]">
              <button
                onClick={() => navigate('/finance')}
                className="w-full py-2 text-center text-xs font-bold text-[#C96243] hover:text-[#AE4F35] flex items-center justify-center gap-1 transition-colors"
              >
                <span>Full Financial Insights</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>

      </div>

      {/* 5. Three Column Grid: Appliance Status, Recent Documents, Smart Assist & Family Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Appliance Status */}
        <Card padding="normal" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0E7E2]">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#C96243]" />
                <h3 className="text-sm font-bold text-[#241D1A] font-display">Appliance Status</h3>
              </div>
              <span className="text-[11px] text-[#716963]">{appliances.length} Monitored</span>
            </div>

            <div className="space-y-2.5">
              {appliances.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-semibold text-[#716963]">
                    No appliances recorded
                  </p>
                  <p className="text-xs text-[#9A908A] mt-1">
                    Add an appliance to start monitoring household equipment.
                  </p>
                </div>
              ) : (
                appliances.slice(0, 4).map((appliance) => (
                  <div
                    key={appliance.id}
                    className={`p-2.5 rounded-xl bg-[#FFF9F6] border flex items-center justify-between ${
                      appliance.status === 'Needs Service'
                        ? 'border-[#D95C5C]/30'
                        : 'border-[#E8DDD6]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#241D1A] truncate">
                        {appliance.name}
                      </p>
                      <p className={`text-[10px] ${
                        appliance.status === 'Needs Service'
                          ? 'text-[#D95C5C] font-semibold'
                          : 'text-[#716963]'
                      }`}>
                        {appliance.status === 'Needs Service'
                          ? 'Maintenance required'
                          : appliance.location || appliance.type || 'Household appliance'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        appliance.status === 'Running'
                          ? 'running'
                          : appliance.status === 'Needs Service'
                            ? 'service'
                            : 'idle'
                      }
                      dot
                      size="sm"
                    >
                      {appliance.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#F0E7E2]">
            <button
              onClick={() => navigate('/appliances')}
              className="text-xs font-bold text-[#C96243] hover:text-[#AE4F35] flex items-center justify-between w-full transition-colors"
            >
              <span>Manage Appliances</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        {/* Recent Documents */}
        <Card padding="normal" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0E7E2]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C96243]" />
                <h3 className="text-sm font-bold text-[#241D1A] font-display">Recent Documents</h3>
              </div>
              <button
                onClick={() => navigate('/documents')}
                className="text-[11px] text-[#C96243] hover:text-[#AE4F35] font-bold transition-colors"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {documents.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate('/documents')}
                  className="p-2.5 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-between hover:border-[#C96243]/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#E8DDD6] flex items-center justify-center text-[#C96243] shrink-0 font-mono text-[10px] font-bold">
                      {doc.format}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#241D1A] truncate">{doc.name}</p>
                      <p className="text-[10px] text-[#716963]">{doc.owner} • {doc.category.split(' ')[0]}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#9A908A] shrink-0 ml-2">{doc.size}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#F0E7E2]">
            <button
              onClick={() => navigate('/documents')}
              className="text-xs font-bold text-[#C96243] hover:text-[#AE4F35] flex items-center justify-between w-full transition-colors"
            >
              <span>Open Document Vault ({documents.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        {/* Smart Assist Quick Panel & Activity */}
        <Card padding="normal" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0E7E2]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#C96243]" />
                <h3 className="text-sm font-bold text-[#241D1A] font-display">Smart Assist</h3>
              </div>
              <span className="text-[10px] text-[#C96243] font-bold bg-[#F4D8CC] px-2 py-0.5 rounded-full border border-[#C96243]/30">
                ✦ AI Active
              </span>
            </div>

            <p className="text-xs text-[#716963] mb-3">
              How can I help manage your home today?
            </p>

            {/* Quick suggested prompt pills */}
            <div className="space-y-1.5">
              {[
                "Review this month's spending",
                "Check upcoming maintenance",
                "Find a document",
                "Show upcoming reminders"
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(prompt)}
                  className="w-full text-left p-2 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] hover:border-[#C96243]/40 text-[11px] font-medium text-[#716963] hover:text-[#241D1A] transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{prompt}</span>
                  <ArrowRight className="w-3 h-3 text-[#C96243] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </button>
              ))}
            </div>

            {/* Recent Family Activity */}
            <div className="mt-4 pt-3 border-t border-[#F0E7E2]">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#241D1A]">
                <Activity className="w-3.5 h-3.5 text-[#C96243]" />
                <span>Family Activity</span>
              </div>
              <div className="space-y-1.5">
                {activityStream.slice(0, 2).map((act) => (
                  <div key={act.id} className="text-[11px] text-[#716963] flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C96243] shrink-0 mt-1.5"></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[#241D1A]">{act.text}</p>
                      <span className="text-[10px] text-[#9A908A]">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#F0E7E2]">
            <button
              onClick={() => navigate('/smart-assist')}
              className="text-xs font-bold text-[#C96243] hover:text-[#AE4F35] flex items-center justify-between w-full transition-colors"
            >
              <span>Open AI Assistant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

      </div>

    </div>
  );
}
