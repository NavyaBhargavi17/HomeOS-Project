const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  import React, { useState } from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import AIInsightCard from '../../components/ui/AIInsightCard';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function FinancePage() {
  const {
    financeSummary,
    spendingCategories,
    upcomingBills,
    payBill,
    transactions,
    addTransaction
  } = useHomeOs();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Form State for Adding Transaction
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    category: 'Food',
    type: 'Expense',
    paymentMethod: 'Bank Transfer',
    notes: ''
  });

  const [formError, setFormError] = useState('');

  const handleCreateTransaction = (e) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount) {
      setFormError('Please provide a description and amount');
      return;
    }

    addTransaction({
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category,
      type: formData.type,
      method: formData.paymentMethod,
      notes: formData.notes
    });

    setFormData({
      description: '',
      amount: '',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: 'Food',
      type: 'Expense',
      paymentMethod: 'Bank Transfer',
      notes: ''
    });
    setFormError('');
    setIsAddModalOpen(false);
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || tx.category === categoryFilter;
    const matchesType = typeFilter === 'All' || tx.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const budgetSpent = financeSummary.monthlyExpenses;
  const budgetTotal = financeSummary.monthlyBudget;
  const budgetRemaining = Math.max(0, budgetTotal - budgetSpent);
  const budgetProgressPercent = budgetTotal > 0
    ? Math.min(100, Math.round((budgetSpent / budgetTotal) * 100))
    : 0;
  const isCriticalOverspending = budgetProgressPercent >= 90;

  return (
    <div className="space-y-7 animate-fadeIn">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#241D1A] tracking-tight font-display">
            Finance Management
          </h2>
          <p className="text-sm text-[#716963] mt-1">
            Understand where your household money goes with transparency.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          icon={Plus}
          className="shadow-sm"
        >
          Add Transaction
        </Button>
      </div>

      {/* 2. Summary (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card padding="normal" className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#716963]">
            Total Balance
          </span>
          <div className="text-2xl font-black text-[#241D1A] tracking-tight">
{money(financeSummary.totalBalance)}
          </div>
          <div className="text-xs text-[#716963] flex items-center gap-1 pt-1">
            <span className="text-[#4FA77B] font-semibold">{financeSummary.totalBalance > 0 ? "Current balance" : "No balance recorded"}</span>
          </div>
        </Card>

        <Card padding="normal" className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#716963]">
            Monthly Income
          </span>
          <div className="text-2xl font-black text-[#241D1A] tracking-tight">
{money(financeSummary.monthlyIncome)}   </div> 
      <div className="text-xs text-[#4FA77B] font-semibold flex items-center gap-1 pt-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{financeSummary.monthlyIncome > 0 ? "Recorded income" : "No income recorded"}</span>
          </div>
        </Card>

        <Card padding="normal" className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#716963]">
            Monthly Expenses
          </span>
          <div className="text-2xl font-black text-[#241D1A] tracking-tight">
         {money(financeSummary.monthlyExpenses)}
          </div>
          <div className="text-xs text-[#E7A84B] font-semibold flex items-center gap-1 pt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{financeSummary.monthlyExpenses > 0 && financeSummary.spendingIncrease > 0 ? `+${financeSummary.spendingIncrease}% vs previous period` : "No comparison data yet"}</span>
          </div>
        </Card>

        <Card padding="normal" className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#716963]">
            Savings
          </span>
          <div className="text-2xl font-black text-[#4FA77B] tracking-tight">
{money(financeSummary.savings)}
          </div>
          <div className="text-xs text-[#716963] flex items-center gap-1 pt-1">
            <span>{financeSummary.monthlyIncome > 0 ? `${Math.max(0, Math.round((financeSummary.savings / financeSummary.monthlyIncome) * 100))}% net savings rate` : "No savings rate yet"}</span>
          </div>
        </Card>
      </div>

      {/* 3. AI Finance Insight Banner */}
      <AIInsightCard
        title="HomeOS Intelligence"
        badge="Finance Insight"
        description={
          transactions.length > 0
            ? `You have ${transactions.length} recorded transaction${transactions.length === 1 ? '' : 's'} and ${upcomingBills.length} upcoming bill${upcomingBills.length === 1 ? '' : 's'}.`
            : "No financial activity has been recorded yet. Add your first transaction to start building your household financial overview."
        }
        recommendation={
          upcomingBills.length > 0
            ? "Review your upcoming bills and record payments as they are completed."
            : "Add income and expense transactions to keep your financial overview up to date."
        }
        actionText={upcomingBills.length > 0 ? "Review Bills" : "Add Transaction"}
        onAction={() => {
          if (upcomingBills.length > 0) {
            payBill(upcomingBills[0].id);
          } else {
            setIsAddModalOpen(true);
          }
        }}
      />

      {/* 4. Spending Breakdown Chart & Monthly Budget Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Spending Breakdown Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card padding="normal" className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0E7E2]">
                <div>
                  <h3 className="text-base font-bold text-[#241D1A] font-display">Spending Breakdown</h3>
                  <p className="text-xs text-[#716963]">Distribution by household categories</p>
                </div>
                <span className="text-xs font-bold text-[#C96243] bg-[#F4D8CC] px-2.5 py-1 rounded-full border border-[#C96243]/30">
                  Total: {money(financeSummary.monthlyExpenses)}
                </span>
              </div>

              {/* Visual Category Bars */}
              <div className="space-y-3.5">
                {spendingCategories.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm font-semibold text-[#716963]">
                      No expenses recorded yet
                    </p>
                    <p className="text-xs text-[#9A908A] mt-1">
                      Add a transaction to see your spending breakdown.
                    </p>
                  </div>
                ) : (
                  spendingCategories.map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#241D1A] flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                        <span className="text-[#716963] font-mono">
                          {money(cat.amount)} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F0E7E2] overflow-hidden border border-[#E8DDD6]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#F0E7E2] text-[11px] text-[#716963] flex items-center justify-between">
              <span>
                {spendingCategories.length > 0
                  ? `Primary Outflow: ${spendingCategories[0].name} (${spendingCategories[0].percentage}%)`
                  : "Primary Outflow: —"}
              </span>
              <span>
                {spendingCategories.length} active expenditure {spendingCategories.length === 1 ? "category" : "categories"}
              </span>
            </div>
          </Card>
        </div>

        {/* Monthly Budget & Upcoming Bills (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Monthly Budget Card */}
          <Card padding="normal" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E7E2]">
              <h3 className="text-base font-bold text-[#241D1A] font-display">Monthly Budget</h3>
              <span className="text-xs font-bold text-[#C96243] bg-[#F4D8CC] px-2.5 py-0.5 rounded-full border border-[#C96243]/30">
                {new Date().toLocaleDateString('en-IN', { month: 'long' })}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#716963]">Total Budget</span>
                <span className="font-bold text-[#241D1A] font-mono">{money(budgetTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#716963]">Amount Spent</span>
                <span className="font-bold text-[#E7A84B] font-mono">{money(budgetSpent)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#716963]">Remaining</span>
                <span className="font-bold text-[#4FA77B] font-mono">{money(budgetRemaining)}</span>
              </div>

              {/* Progress Indicator */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className={isCriticalOverspending ? 'text-[#D95C5C]' : 'text-[#C96243]'}>
                    {budgetProgressPercent}% Used
                  </span>
                  <span className="text-[#716963]">
                    {100 - budgetProgressPercent}% Remaining
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#F0E7E2] overflow-hidden p-0.5 border border-[#E8DDD6]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCriticalOverspending ? 'bg-[#D95C5C]' : 'bg-[#C96243]'
                    }`}
                    style={{ width: `${budgetProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Upcoming Bills (Inside Finance Management) */}
          <Card padding="normal" className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E7E2]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C96243]" />
                <h3 className="text-base font-bold text-[#241D1A] font-display">Upcoming Bills</h3>
              </div>
              <span className="text-xs font-bold text-[#C96243] bg-[#F4D8CC] px-2.5 py-0.5 rounded-full border border-[#C96243]/30">
                {upcomingBills.length} Due
              </span>
            </div>

            <div className="space-y-2.5">
              {upcomingBills.length === 0 ? (
                <p className="text-xs text-[#716963] py-4 text-center">All upcoming bills settled! 🎉</p>
              ) : (
                upcomingBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-3 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-between gap-3 hover:border-[#C96243]/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#241D1A] truncate">{bill.name}</p>
                        <Badge
                          variant={bill.dueDate.includes('Tomorrow') ? 'urgent' : 'warning'}
                          size="sm"
                        >
                          {bill.dueDate}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#716963] mt-0.5">
                        {money(bill.amount)} • {bill.provider}
                      </p>
                    </div>

                    <button
                      onClick={() => payBill(bill.id)}
                      className="px-3 py-1 text-[11px] font-bold text-white bg-[#C96243] hover:bg-[#AE4F35] rounded-lg transition-colors shrink-0 shadow-xs"
                    >
                      Pay Now
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

      </div>

      {/* 5. Transactions Section */}
      <Card padding="normal" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#F0E7E2]">
          <div>
            <h3 className="text-base font-bold text-[#241D1A] font-display">Transactions</h3>
            <p className="text-xs text-[#716963]">Household records, income ledger, and expenses</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-[#9A908A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none focus:border-[#C96243]"
            >
              <option value="All">All Categories</option>
              <option value="Utilities">Utilities</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Income">Income</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none focus:border-[#C96243]"
            >
              <option value="All">All Types</option>
              <option value="Expense">Expenses</option>
              <option value="Income">Income</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8DDD6] text-[11px] font-bold uppercase tracking-wider text-[#716963]">
                <th className="pb-3 pl-2">Date</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Type</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E7E2] text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#716963]">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'Income';
                  return (
                    <tr key={tx.id} className="hover:bg-[#FFF9F6] transition-colors">
                      <td className="py-3 pl-2 font-mono text-[#716963]">{tx.date}</td>
                      <td className="py-3 font-bold text-[#241D1A]">{tx.description}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF9F6] text-[#716963] text-[11px] font-medium border border-[#E8DDD6]">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 text-[#716963]">{tx.method}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          isIncome ? 'text-[#4FA77B]' : 'text-[#716963]'
                        }`}>
                          {isIncome ? <ArrowDownLeft className="w-3.5 h-3.5 text-[#4FA77B]" /> : <ArrowUpRight className="w-3.5 h-3.5 text-[#C96243]" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-bold font-mono ${
                        isIncome ? 'text-[#4FA77B]' : 'text-[#241D1A]'
                      }`}>
                        {isIncome ? '+' : '-'}{money(tx.amount)}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <Badge
                          variant={tx.status === 'Completed' ? 'running' : 'warning'}
                          size="sm"
                        >
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="md:hidden space-y-3">
          {filteredTransactions.length === 0 ? (
            <p className="text-center py-6 text-xs text-[#716963]">No transactions match filters.</p>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'Income';
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#716963]">{tx.date}</span>
                    <Badge variant={tx.status === 'Completed' ? 'running' : 'warning'} size="sm">
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#241D1A]">{tx.description}</p>
                      <p className="text-[10px] text-[#716963]">{tx.category} • {tx.method}</p>
                    </div>
                    <div className={`text-sm font-extrabold font-mono ${isIncome ? 'text-[#4FA77B]' : 'text-[#241D1A]'}`}>
                      {isIncome ? '+' : '-'}{money(tx.amount)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Household Transaction"
        subtitle="Record an income deposit or everyday household expense"
      >
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#FBE6E6] border border-[#D95C5C]/30 text-xs text-[#D95C5C]">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
              Description *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Electricity Bill, Grocery Store, Salary"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                Date
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:border-[#C96243] text-[#241D1A]"
              >
                <option value="Utilities">Utilities</option>
                <option value="Food">Food</option>
                <option value="Housing">Housing</option>
                <option value="Transport">Transport</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:border-[#C96243] text-[#241D1A]"
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:border-[#C96243] text-[#241D1A]"
              >
                                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Auto-Debit">Auto-Debit</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional remark"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 text-[#241D1A] placeholder:text-[#9A908A]"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8DDD6]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
            >
              Add Transaction
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
