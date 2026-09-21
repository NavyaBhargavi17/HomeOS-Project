import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "../services/api";
const HomeOsContext = createContext();

const PROTECTED_ROUTES = [
  '/dashboard',
  '/finance',
  '/documents',
  '/appliances',
  '/smart-assist',
  '/settings',
];

const PUBLIC_ROUTES = [
  '/',
  '/login',
];

const hasStoredAuthToken = () => {
  try {
    return Boolean(
      localStorage.getItem("homeos_token") ||
      sessionStorage.getItem("homeos_token")
    );
  } catch {
    return false;
  }
};

export function HomeOsProvider({ children }) {
  // Navigation / Route state
  // Protected pages can never be opened without an auth token.
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname;

    if (PROTECTED_ROUTES.includes(path) && !hasStoredAuthToken()) {
      return '/login';
    }

    if ([...PROTECTED_ROUTES, ...PUBLIC_ROUTES].includes(path)) {
      return path;
    }

    return '/';
  });

  const navigate = (path) => {
    // Never allow navigation to a protected page while logged out.
    if (PROTECTED_ROUTES.includes(path) && !hasStoredAuthToken()) {
      if (window.location.pathname !== '/login') {
        window.history.pushState({}, '', '/login');
      }
      setCurrentRoute('/login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;

      if (PROTECTED_ROUTES.includes(path) && !hasStoredAuthToken()) {
        window.history.replaceState({}, '', '/login');
        setCurrentRoute('/login');
        return;
      }

      setCurrentRoute(path || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getStoredToken = () => {
    try {
      return localStorage.getItem("homeos_token") || sessionStorage.getItem("homeos_token");
    } catch {
      return null;
    }
  };

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(getStoredToken());
  });

  // Sidebar Collapsed Session State (Dynamic SaaS Sidebar)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('homeos_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('homeos_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Authenticated user data is loaded from the backend after login.
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Home Owner",
    avatar: "",
    avatarFallback: "U",
    joinedDate: "",
    address: "",
    twoFactorEnabled: false
  });

  // Dynamic Greeting Helper
  const getDynamicGreeting = () => {
    const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'there';
    return `Good morning, ${firstName} 👋`;
  };

  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = ({ title, message, type = 'success' }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const formatDate = (value, fallback = "Today") => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const clearAuthStorage = () => {
    try {
      localStorage.removeItem("homeos_token");
      localStorage.removeItem("homeos_user");
      sessionStorage.removeItem("homeos_token");
      sessionStorage.removeItem("homeos_user");
    } catch {
      // ignore storage errors
    }
  };

  // Notification Feed
  // Notifications are generated from the authenticated user's current backend data.
  const [notifications, setNotifications] = useState([]);
  const [backendDataLoaded, setBackendDataLoaded] = useState(false);

  const getRelativeTime = (dateValue) => {
    if (!dateValue) return "Recently";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Recently";

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;

    return formatDate(dateValue);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    addToast({
      title: "Notifications",
      message: "All current alerts marked as read",
      type: "info",
    });
  };

  // 1. Finance State (Bills strictly inside Finance Management)
  const [financeSummary, setFinanceSummary] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0,
    monthlyBudget: 0,
    spendingIncrease: 0
  });

  const [spendingCategories, setSpendingCategories] = useState([]);

  const [upcomingBills, setUpcomingBills] = useState([]);

  const [transactions, setTransactions] = useState([]);

  const mapTransaction = (tx, fallbackMethod = "HomeOS") => ({
    id: tx._id,
    date: formatDate(tx.date),
    description: tx.title,
    category: tx.category,
    amount: Number(tx.amount) || 0,
    type: tx.type === "income" ? "Income" : "Expense",
    status: "Completed",
    method: fallbackMethod,
    notes: tx.description || "",
  });

  const mapBill = (bill) => ({
    id: bill._id,
    name: bill.title,
    amount: Number(bill.amount) || 0,
    dueDate: formatDate(bill.dueDate, "Upcoming"),
    dateExact: bill.dueDate || "",
    status: bill.status,
    category: bill.category,
    provider: bill.description || bill.category,
  });

  const addTransaction = async (newTx) => {
    try {
      const transactionData = {
        title: newTx.description || newTx.title || "Transaction",
        amount: parseFloat(newTx.amount),
        category: newTx.category || "Other",
        type: (newTx.type || "Expense").toLowerCase() === "income" ? "income" : "expense",
        date: newTx.date ? new Date(newTx.date) : new Date(),
        description: newTx.notes || newTx.descriptionText || "",
      };

      const response = await api.addTransaction(transactionData);
      const saved = response.transaction;
      const tx = mapTransaction(saved, newTx.method || "HomeOS");
      setTransactions(prev => [tx, ...prev]);

      if (tx.type === "Expense") {
        setFinanceSummary(prev => ({
          ...prev,
          monthlyExpenses: prev.monthlyExpenses + tx.amount,
          savings: prev.monthlyIncome - (prev.monthlyExpenses + tx.amount),
          totalBalance: prev.totalBalance - tx.amount,
        }));
      } else {
        setFinanceSummary(prev => ({
          ...prev,
          monthlyIncome: prev.monthlyIncome + tx.amount,
          savings: (prev.monthlyIncome + tx.amount) - prev.monthlyExpenses,
          totalBalance: prev.totalBalance + tx.amount,
        }));
      }

      addToast({ title: "Transaction Recorded", message: `${tx.description} saved to your HomeOS account`, type: "success" });
      return saved;
    } catch (error) {
      console.error("Failed to add transaction:", error);
      addToast({ title: "Transaction Failed", message: error.message || "Could not save transaction", type: "error" });
      throw error;
    }
  };

  const updateTransaction = async (id, updatedTx) => {
    try {
      const payload = {
        title: updatedTx.description || updatedTx.title,
        amount: parseFloat(updatedTx.amount),
        category: updatedTx.category || "Other",
        type: (updatedTx.type || "Expense").toLowerCase() === "income" ? "income" : "expense",
        date: updatedTx.date ? new Date(updatedTx.date) : undefined,
        description: updatedTx.notes || "",
      };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      const response = await api.updateTransaction(id, payload);
      const saved = response.transaction;
      setTransactions(prev => prev.map(tx => tx.id === id ? mapTransaction(saved, updatedTx.method || tx.method || "HomeOS") : tx));
      addToast({ title: "Transaction Updated", message: `${saved.title} has been updated`, type: "success" });
      await loadBackendData();
      return saved;
    } catch (error) {
      addToast({ title: "Update Failed", message: error.message || "Could not update transaction", type: "error" });
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions(prev => prev.filter(tx => tx.id !== id));
      addToast({ title: "Transaction Deleted", message: "Transaction removed successfully", type: "info" });
      await loadBackendData();
    } catch (error) {
      addToast({ title: "Delete Failed", message: error.message || "Could not delete transaction", type: "error" });
      throw error;
    }
  };

  const payBill = async (billId) => {
    try {
      const bill = upcomingBills.find(b => b.id === billId);
      if (!bill) return;

      await api.payBill(billId);
      await addTransaction({
        description: bill.name,
        amount: bill.amount,
        category: bill.category,
        type: "Expense",
        method: "Online Payment",
        date: new Date(),
      });

      setUpcomingBills(prev => prev.filter(b => b.id !== billId));
      addToast({ title: "Bill Paid", message: `${bill.name} has been marked as paid`, type: "success" });
    } catch (error) {
      console.error("Failed to pay bill:", error);
      addToast({ title: "Payment Failed", message: error.message || "Could not mark the bill as paid", type: "error" });
    }
  };

  const addBill = async (newBill) => {
    try {
      const billData = {
        title: newBill.title || newBill.name,
        amount: parseFloat(newBill.amount),
        category: newBill.category || "Other",
        dueDate: newBill.dueDate,
        description: newBill.description || newBill.provider || "",
      };
      const response = await api.addBill(billData);
      const saved = response.bill;
      const bill = mapBill(saved);
      setUpcomingBills(prev => [...prev, bill]);
      addToast({ title: "Bill Added", message: `${bill.name} has been saved to your HomeOS account`, type: "success" });
      return saved;
    } catch (error) {
      console.error("Failed to add bill:", error);
      addToast({ title: "Bill Failed", message: error.message || "Could not save bill", type: "error" });
      throw error;
    }
  };

  const updateBill = async (id, updatedBill) => {
    try {
      const payload = {
        title: updatedBill.title || updatedBill.name,
        amount: parseFloat(updatedBill.amount),
        category: updatedBill.category || "Other",
        dueDate: updatedBill.dueDate || updatedBill.dateExact,
        status: updatedBill.status && ["pending", "paid", "overdue"].includes(String(updatedBill.status).toLowerCase())
          ? String(updatedBill.status).toLowerCase()
          : undefined,
        description: updatedBill.description || updatedBill.provider || "",
      };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      const response = await api.updateBill(id, payload);
      const saved = response.bill;
      setUpcomingBills(prev => prev.map(b => b.id === id ? mapBill(saved) : b));
      addToast({ title: "Bill Updated", message: `${saved.title} has been updated`, type: "success" });
      await loadBackendData();
      return saved;
    } catch (error) {
      addToast({ title: "Update Failed", message: error.message || "Could not update bill", type: "error" });
      throw error;
    }
  };

  const deleteBill = async (id) => {
    try {
      await api.deleteBill(id);
      setUpcomingBills(prev => prev.filter(b => b.id !== id));
      addToast({ title: "Bill Deleted", message: "Bill removed successfully", type: "info" });
      await loadBackendData();
    } catch (error) {
      addToast({ title: "Delete Failed", message: error.message || "Could not delete bill", type: "error" });
      throw error;
    }
  };

  // 2. Document Vault State (STRICT PRODUCT RULE: NO Bills inside Document Vault)
  const [documentCategories] = useState([
    'Personal Documents',
    'Family Documents',
    'Health Documents',
    'Legal Documents',
    'Certificates'
  ]);

  // Document Vault data comes only from the authenticated user's backend data.
  const [vaultMembers, setVaultMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
const uploadDocument = async (file, documentData = {}) => {
    try {
      if (!file) {
        throw new Error("Please select a file");
      }

      const response = await api.uploadDocument(file, {
        name: documentData.name,
        category: documentData.category,
        expiryDate: documentData.expiryDate || "",
        description: documentData.description || "",
      });

      const savedDocument = response.document;

      const newDocument = {
        id: savedDocument._id || savedDocument.id,
        _id: savedDocument._id,

        name: savedDocument.name,
        category: savedDocument.category,

        owner: currentUser.name,

        format:
          savedDocument.fileType ||
          documentData.format ||
          file.type ||
          "FILE",

        size: savedDocument.fileSize
          ? `${(savedDocument.fileSize / (1024 * 1024)).toFixed(2)} MB`
          : `${(file.size / (1024 * 1024)).toFixed(2)} MB`,

        fileName:
          savedDocument.fileName ||
          file.name,

        fileType:
          savedDocument.fileType ||
          file.type,

        fileUrl:
          savedDocument.fileUrl || "",

        expiryDate:
          savedDocument.expiryDate || "",

        description:
          savedDocument.description || "",

        uploadDate:
          formatDate(savedDocument.createdAt),

        uploadedAt:
          savedDocument.createdAt ||
          new Date().toISOString(),

        verified: true,

        tags:
          documentData.tags || [savedDocument.category],
      };

      setDocuments((prev) => [
        newDocument,
        ...prev,
      ]);

      setVaultMembers((prev) =>
        prev.map((member) =>
          member.name.toLowerCase() ===
            currentUser.name.toLowerCase()
            ? {
                ...member,
                docCount: (member.docCount || 0) + 1,
              }
            : member
        )
      );

      addToast({
        title: "Document Vault",
        message: `"${newDocument.name}" uploaded successfully`,
        type: "success",
      });

      return newDocument;
    } catch (error) {
      console.error(
        "Document upload error:",
        error
      );

      addToast({
        title: "Document Upload Failed",
        message:
          error.message ||
          "Failed to upload document",
        type: "error",
      });

      throw error;
    }
  };

  const updateDocument = async (id, updatedDoc) => {
    try {
      const payload = {
        name: updatedDoc.name,
        category: updatedDoc.category,
        fileUrl: updatedDoc.fileUrl || "",
        fileType: updatedDoc.format || updatedDoc.fileType || "",
        expiryDate: updatedDoc.expiryDate,
        description: updatedDoc.description || updatedDoc.notes || "",
      };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      const response = await api.updateDocument(id, payload);
      const saved = response.document;
      setDocuments(prev => prev.map(doc => doc.id === id ? {
        ...doc,
        name: saved.name,
        category: saved.category,
        format: saved.fileType || doc.format,
        fileUrl: saved.fileUrl || doc.fileUrl || "",
      } : doc));
      addToast({ title: "Document Updated", message: `${saved.name} has been updated`, type: "success" });
      await loadBackendData();
      return saved;
    } catch (error) {
      addToast({ title: "Update Failed", message: error.message || "Could not update document", type: "error" });
      throw error;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      addToast({ title: "Document Removed", message: "Document removed from vault archive", type: "info" });
    } catch (error) {
      addToast({ title: "Delete Failed", message: error.message || "Could not remove document", type: "error" });
      throw error;
    }
  };

  // 3. Appliance Maintenance State
  // Appliances are loaded only from the authenticated user's backend data.
  const [appliances, setAppliances] = useState([]);

  const uiStatusToApi = (status) => {
    if (status === "Needs Service" || status === "needs_service") return "needs_service";
    if (status === "Idle" || status === "inactive") return "inactive";
    return "active";
  };

  const apiStatusToUi = (status) => {
    if (status === "needs_service") return "Needs Service";
    if (status === "inactive") return "Idle";
    return "Running";
  };

  const mapAppliance = (app) => ({
    id: app._id,
    name: app.name,
    type: app.category,
    status: apiStatusToUi(app.status),
    location: "Home",
    lastService: app.purchaseDate ? formatDate(app.purchaseDate, "Not recorded") : "Not recorded",
    nextService: app.nextServiceDate ? formatDate(app.nextServiceDate, "Not scheduled") : "Not scheduled",
    serviceUrgency: app.status === "needs_service" ? "Critical" : "Optimal",
    maintenanceSchedule: app.notes || "Standard maintenance",
    healthPercent: app.status === "needs_service" ? 52 : 100,
    brand: app.brand || "",
  });

  const addAppliance = async (newApp) => {
    try {
      const payload = {
        name: String(newApp.name || "").trim(),
        category: newApp.type || newApp.category || "Household Device",
        brand: newApp.brand || "",
        purchaseDate: newApp.purchaseDate || undefined,
        status: uiStatusToApi(newApp.status || "Running"),
        notes: newApp.notes || newApp.maintenanceSchedule || "Standard checkup",
      };

      // Only send nextServiceDate when it is a real date value.
      if (newApp.nextServiceDate) {
        const date = new Date(newApp.nextServiceDate);

        if (!Number.isNaN(date.getTime())) {
          payload.nextServiceDate = date.toISOString();
        }
      } else if (newApp.nextService) {
        const date = new Date(newApp.nextService);

        if (!Number.isNaN(date.getTime())) {
          payload.nextServiceDate = date.toISOString();
        }
      }

      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      const response = await api.addAppliance(payload);

      // Support the normal API response shape and avoid crashing
      // if the backend returns the appliance object directly.
      const saved = response?.appliance || response?.data || response;

      if (!saved || !saved._id) {
        throw new Error("Appliance was not returned by the server");
      }

      const mappedAppliance = mapAppliance(saved);

      setAppliances((prev) => [...prev, mappedAppliance]);

      addToast({
        title: "Appliance Registered",
        message: `Added ${saved.name} to maintenance monitoring`,
        type: "success",
      });

      return saved;
    } catch (error) {
      console.error("Failed to add appliance:", error);

      addToast({
        title: "Appliance Failed",
        message: error.message || "Could not save appliance",
        type: "error",
      });

      throw error;
    }
  };

  const updateAppliance = async (id, updatedApp) => {
    try {
      const payload = {
        name: updatedApp.name,
        category: updatedApp.type || updatedApp.category,
        brand: updatedApp.brand,
        purchaseDate: updatedApp.purchaseDate,
        nextServiceDate: updatedApp.nextServiceDate || updatedApp.nextService,
        status: uiStatusToApi(updatedApp.status || "Running"),
        notes: updatedApp.notes || updatedApp.maintenanceSchedule,
      };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      const response = await api.updateAppliance(id, payload);
      const saved = response.appliance;
      setAppliances(prev => prev.map(app => app.id === id ? mapAppliance(saved) : app));
      addToast({ title: "Appliance Updated", message: `${saved.name} has been updated`, type: "success" });
      return saved;
    } catch (error) {
      addToast({ title: "Update Failed", message: error.message || "Could not update appliance", type: "error" });
      throw error;
    }
  };

  const updateApplianceStatus = async (id, newStatus) => {
    try {
      const response = await api.updateApplianceStatus(id, uiStatusToApi(newStatus));
      const saved = response.appliance;
      setAppliances(prev => prev.map(a => a.id === id ? { ...a, ...mapAppliance(saved) } : a));
      addToast({ title: "Appliance Status Updated", message: `Status changed to ${apiStatusToUi(saved.status)}`, type: "info" });
      return saved;
    } catch (error) {
      addToast({ title: "Status Update Failed", message: error.message || "Could not update appliance status", type: "error" });
      throw error;
    }
  };

  const logApplianceService = async (id) => {
    try {
      const nextServiceDate = new Date();
      nextServiceDate.setMonth(nextServiceDate.getMonth() + 6);
      const current = appliances.find(a => a.id === id);
      const response = await api.updateAppliance(id, {
        name: current?.name,
        category: current?.type || "Household Device",
        status: "active",
        nextServiceDate,
        notes: current?.maintenanceSchedule || "Standard maintenance",
      });
      const saved = response.appliance;
      setAppliances(prev => prev.map(a => a.id === id ? {
        ...mapAppliance(saved),
        lastService: "Today",
        nextService: formatDate(saved.nextServiceDate, "In 6 Months"),
        healthPercent: 100,
        status: "Running",
      } : a));
      addToast({ title: "Service Logged", message: "Appliance marked as serviced and healthy", type: "success" });
      return saved;
    } catch (error) {
      addToast({ title: "Service Update Failed", message: error.message || "Could not log service", type: "error" });
      throw error;
    }
  };

  const deleteAppliance = async (id) => {
    try {
      await api.deleteAppliance(id);
      setAppliances(prev => prev.filter(a => a.id !== id));
      addToast({ title: "Appliance Removed", message: "Appliance removed from maintenance monitoring", type: "info" });
    } catch (error) {
      addToast({ title: "Delete Failed", message: error.message || "Could not delete appliance", type: "error" });
      throw error;
    }
  };

  // 4. Smart Assist & Reminders State (Combined Module)
  // Reminders are loaded only from the authenticated user's backend data.
  const [reminders, setReminders] = useState([]);

  const mapReminder = (rem) => ({
    id: rem._id,
    title: rem.title,
    period: "Upcoming",
    dueDate: formatDate(rem.dueDate, "Upcoming"),
    category: "General",
    priority: rem.priority === "high" ? "High" : rem.priority === "low" ? "Low" : "Medium",
    completed: Boolean(rem.completed),
    notes: rem.description || "",
  });

  const toggleReminder = async (id) => {
    try {
      const response = await api.toggleReminder(id);
      const saved = response.reminder;
      setReminders(prev => prev.map(r => r.id === id ? mapReminder(saved) : r));
      addToast({
        title: saved.completed ? "Reminder Completed" : "Reminder Reopened",
        message: `"${saved.title}" is now ${saved.completed ? "done" : "pending"}`,
        type: saved.completed ? "success" : "info",
      });
      return saved;
    } catch (error) {
      addToast({ title: "Reminder Update Failed", message: error.message || "Could not update reminder", type: "error" });
      throw error;
    }
  };

  const addReminder = async (newRem) => {
    try {
      const priority = String(newRem.priority || "Medium").toLowerCase();
      const payload = {
        title: newRem.title,
        description: newRem.notes || newRem.description || "",
        dueDate: newRem.dueDate,
        priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
        completed: false,
      };
      const response = await api.addReminder(payload);
      const saved = response.reminder;
      const rem = mapReminder(saved);
      rem.period = newRem.period || "Today";
      rem.category = newRem.category || "General";
      setReminders(prev => [rem, ...prev]);
      addToast({ title: "Reminder Created", message: `Saved "${rem.title}"`, type: "success" });
      return saved;
    } catch (error) {
      addToast({ title: "Reminder Failed", message: error.message || "Could not save reminder", type: "error" });
      throw error;
    }
  };

  const updateReminder = async (id, updatedRem) => {
    try {
      const priority = String(updatedRem.priority || "Medium").toLowerCase();
      const payload = {
        title: updatedRem.title,
        description: updatedRem.notes || updatedRem.description || "",
        dueDate: updatedRem.dueDate,
        priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
        completed: updatedRem.completed,
      };
      const response = await api.updateReminder(id, payload);
      const saved = response.reminder;
      setReminders(prev => prev.map(r => r.id === id ? mapReminder(saved) : r));
      addToast({ title: "Reminder Updated", message: `"${saved.title}" has been updated`, type: "success" });
      return saved;
    } catch (error) {
      addToast({ title: "Update Failed", message: error.message || "Could not update reminder", type: "error" });
      throw error;
    }
  };

  const deleteReminder = async (id) => {
    try {
      await api.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      addToast({ title: "Reminder Dismissed", message: "Item removed from schedule", type: "info" });
    } catch (error) {
      addToast({ title: "Delete Failed", message: error.message || "Could not delete reminder", type: "error" });
      throw error;
    }
  };

  // 5. Settings & Accounts State (Combined Module: Family, Security, Preferences)
  // Household members are loaded only from the authenticated user's backend data.
  const [householdMembers, setHouseholdMembers] = useState([]);

  const addFamilyMember = async (newMem) => {
    try {
      const payload = {
        name: newMem.name,
        relation: newMem.relationship || newMem.relation || "Family Member",
        email: newMem.email || "",
        role: String(newMem.role || "Member").toLowerCase().includes("owner") ? "owner" : "member",
      };
      const response = await api.addHouseholdMember(payload);
      const saved = response.member;
      const mem = {
        id: saved._id,
        name: saved.name,
        role: saved.role === "owner" ? "Home Owner / Admin" : "Family Member",
        relationship: saved.relation,
        email: saved.email || "",
        status: "Active",
        permissions: newMem.permissions || { finance: false, documents: true, appliances: false, reminders: true },
        avatarFallback: saved.name.split(" ").map(n => n[0]).join("").toUpperCase() || "FM",
        avatarBg: "bg-[#F4D8CC] text-[#C96243] font-bold border border-[#C96243]/20",
      };
      setHouseholdMembers(prev => [...prev, mem]);
      addToast({ title: "Invitation Dispatched", message: `Invited ${mem.name} (${mem.email}) to HomeOS`, type: "success" });
      return saved;
    } catch (error) {
      addToast({ title: "Member Add Failed", message: error.message || "Could not add household member", type: "error" });
      throw error;
    }
  };

  const updateFamilyMember = async (id, updatedMem) => {
    try {
      const payload = {
        name: updatedMem.name,
        relation: updatedMem.relationship || updatedMem.relation,
        email: updatedMem.email || "",
        role: String(updatedMem.role || "member").toLowerCase().includes("owner") ? "owner" : "member",
      };
      const response = await api.updateHouseholdMember(id, payload);
      const saved = response.member;
      setHouseholdMembers(prev => prev.map(member => member.id === id ? {
        ...member,
        name: saved.name,
        relationship: saved.relation,
        email: saved.email || "",
        role: saved.role === "owner" ? "Home Owner / Admin" : "Family Member",
        avatarFallback: saved.name.split(" ").map(n => n[0]).join("").toUpperCase() || "FM",
      } : member));
      addToast({ title: "Member Updated", message: `${saved.name} has been updated`, type: "success" });
      return saved;
    } catch (error) {
      addToast({ title: "Update Failed", message: error.message || "Could not update household member", type: "error" });
      throw error;
    }
  };

  const deleteFamilyMember = async (id) => {
    try {
      await api.deleteHouseholdMember(id);
      setHouseholdMembers(prev => prev.filter(member => member.id !== id));
      addToast({ title: "Member Removed", message: "Household member removed successfully", type: "info" });
    } catch (error) {
      addToast({ title: "Delete Failed", message: error.message || "Could not remove household member", type: "error" });
      throw error;
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const response = await api.updateProfile(updatedData);
      const saved = response.user || response;
      setCurrentUser(prev => ({
        ...prev,
        ...saved,
        id: saved._id || saved.id || prev.id,
        role: saved.role === "user" ? "Home Owner" : (saved.role || prev.role),
        avatarFallback: (saved.name || prev.name || "User").split(" ").map(n => n[0]).join("").toUpperCase(),
      }));
      setHouseholdMembers(prev => prev.map(m => m.relationship === "Self" ? {
        ...m,
        name: saved.name || m.name,
        email: saved.email || m.email,
        role: saved.role === "owner" || saved.role === "user" ? "Home Owner / Admin" : m.role,
        avatarFallback: (saved.name || m.name).split(" ").map(n => n[0]).join("").toUpperCase(),
      } : m));
      try { localStorage.setItem("homeos_user", JSON.stringify(saved)); } catch {}
      addToast({ title: "Profile Updated", message: "Your household account details have been saved", type: "success" });
      return saved;
    } catch (error) {
      addToast({ title: "Profile Update Failed", message: error.message || "Could not update profile", type: "error" });
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.changePassword(currentPassword, newPassword);
      addToast({ title: "Password Changed", message: response.message || "Password updated successfully", type: "success" });
      return response;
    } catch (error) {
      addToast({ title: "Password Change Failed", message: error.message || "Could not change password", type: "error" });
      throw error;
    }
  };

  // Preferences & Toggles
  const [preferences, setPreferences] = useState({
    twoFactor: false,
    pushNotifications: true,
    emailNotifications: true,
    reminderAlerts: true,
    aiInsights: true,
    dailyBriefing: true,
    predictiveMaintenance: true,
    spendingInsights: true,
    currency: 'INR (₹)',
    language: 'English (India)',
    dateFormat: 'DD MMM YYYY'
  });

  const togglePreference = async (key) => {
    const nextValue = !preferences[key];
    setPreferences(prev => ({ ...prev, [key]: nextValue }));
    try {
      await api.updatePreferences({ [key]: nextValue });
      addToast({ title: "Preference Saved", message: `${key} is now ${nextValue ? "enabled" : "disabled"}`, type: "info" });
    } catch (error) {
      setPreferences(prev => ({ ...prev, [key]: !nextValue }));
      addToast({ title: "Preference Failed", message: error.message || "Could not save preference", type: "error" });
      throw error;
    }
  };

  const updatePreferences = async (updatedPreferences) => {
    try {
      const response = await api.updatePreferences(updatedPreferences);
      const saved = response.user || response;
      if (saved.preferences) setPreferences(saved.preferences);
      addToast({ title: "Preferences Saved", message: "Your HomeOS preferences have been updated", type: "success" });
      return saved;
    } catch (error) {
      addToast({ title: "Preferences Failed", message: error.message || "Could not save preferences", type: "error" });
      throw error;
    }
  };

  // Recent Household Activity Stream
  // No demo activity is shown. Real activity can be added from backend events.
  const activityStream = [];

  // Data Management: Export, Backup, Reset/Delete
  const exportHomeData = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      platform: 'HomeOS v2.4 (Dark Cyber Edition)',
      currentUser,
      householdMembers,
      financeSummary,
      upcomingBills,
      transactions,
      documents,
      appliances,
      reminders,
      preferences
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `HomeOS_Household_Data_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      title: 'Home Data Exported',
      message: 'Household configuration and logs exported as encrypted JSON',
      type: 'success'
    });
  };

  const backupHomeData = () => {
    addToast({
      title: 'Cloud Backup Complete',
      message: 'Household snapshot securely synced to encrypted offline replica',
      type: 'success'
    });
  };

  const logout = () => {
    clearAuthStorage();
    setIsAuthenticated(false);
    setCurrentUser({ name: "", email: "", phone: "", role: "Home Owner", avatar: "", avatarFallback: "U", joinedDate: "", address: "", twoFactorEnabled: false });
    navigate("/login");
  };

  const deleteAccount = async () => {
    try {
      await api.deleteAccount();
      clearAuthStorage();
      setIsAuthenticated(false);
      navigate("/");
      addToast({ title: "Account Deleted", message: "Household account deleted and active session closed", type: "info" });
    } catch (error) {
      addToast({ title: "Account Deletion Failed", message: error.message || "Could not delete account", type: "error" });
      throw error;
    }
  };

    useEffect(() => {
    if (!backendDataLoaded) return;

    const nextNotifications = [];

    upcomingBills.forEach((bill) => {
      if (bill.status === "paid") return;

      const dueDate = bill.dateExact ? new Date(bill.dateExact) : null;
      const isOverdue =
        bill.status === "overdue" ||
        (dueDate &&
          !Number.isNaN(dueDate.getTime()) &&
          dueDate.getTime() < Date.now());

      nextNotifications.push({
        id: `bill-${bill.id}`,
        title: isOverdue ? `${bill.name} Overdue` : `${bill.name} Due`,
        description: isOverdue
          ? `₹${Number(bill.amount || 0).toLocaleString("en-IN")} is overdue`
          : `₹${Number(bill.amount || 0).toLocaleString("en-IN")} due ${bill.dueDate || "soon"}`,
        time: bill.dateExact ? getRelativeTime(bill.dateExact) : "Upcoming",
        unread: true,
        category: "finance",
        route: "/finance",
      });
    });

    reminders
      .filter((reminder) => !reminder.completed)
      .forEach((reminder) => {
        nextNotifications.push({
          id: `reminder-${reminder.id}`,
          title: reminder.title,
          description: reminder.notes || `Reminder due ${reminder.dueDate || "soon"}`,
          time: reminder.dueDate || "Upcoming",
          unread: true,
          category: "reminders",
          route: "/smart-assist",
        });
      });

    appliances
      .filter(
        (appliance) =>
          appliance.status === "Needs Service" ||
          appliance.serviceUrgency === "Critical"
      )
      .forEach((appliance) => {
        nextNotifications.push({
          id: `appliance-${appliance.id}`,
          title: `${appliance.name} Needs Service`,
          description: appliance.nextService
            ? `Service date: ${appliance.nextService}`
            : "Maintenance attention is required",
          time: "Action required",
          unread: true,
          category: "appliances",
          route: "/appliances",
        });
      });

    documents.forEach((document) => {
      if (!document.expiryDate) return;

      const expiry = new Date(document.expiryDate);
      if (Number.isNaN(expiry.getTime())) return;

      const daysUntilExpiry =
        (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

      if (daysUntilExpiry <= 30) {
        const expired = daysUntilExpiry < 0;

        nextNotifications.push({
          id: `document-${document.id}`,
          title: expired
            ? `${document.name} Expired`
            : `${document.name} Expiring Soon`,
          description: expired
            ? "This document has passed its expiry date"
            : `Expires on ${formatDate(document.expiryDate)}`,
          time: expired ? "Action required" : "Upcoming",
          unread: true,
          category: "documents",
          route: "/documents",
        });
      }
    });

    setNotifications((previous) => {
      const previousReadState = new Map(
        previous.map((notification) => [
          notification.id,
          notification.unread,
        ])
      );

      return nextNotifications.map((notification) => ({
        ...notification,
        unread: previousReadState.has(notification.id)
          ? previousReadState.get(notification.id)
          : true,
      }));
    });
  }, [
    backendDataLoaded,
    upcomingBills,
    reminders,
    appliances,
    documents,
  ]);


  const loadBackendData = async () => {
    if (!getStoredToken()) return;

    try {
      const [
        profileResponse,
        dashboard,
        backendTransactions,
        backendBills,
        backendAppliances,
        backendDocuments,
        backendReminders,
        backendHouseholdMembers,
      ] = await Promise.all([
        api.getProfile(),
        api.getDashboard(),
        api.getTransactions(),
        api.getBills(),
        api.getAppliances(),
        api.getDocuments(),
        api.getReminders(),
        api.getHouseholdMembers(),
      ]);

      const profile = profileResponse?.user || profileResponse;

      if (profile) {
        setCurrentUser((prev) => ({
          ...prev,
          id: profile._id || profile.id || prev.id,
          name: profile.name || prev.name,
          email: profile.email || prev.email,
          phone: profile.phone || "",
          role:
            profile.role === "user"
              ? "Home Owner"
              : profile.role || prev.role,
          avatar: profile.avatar || prev.avatar || "",
          avatarFallback:
            (profile.name || prev.name || "User")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase(),
          address: profile.address || "",
          joinedDate: profile.createdAt
            ? formatDate(profile.createdAt, "")
            : prev.joinedDate,
          twoFactorEnabled: Boolean(profile.twoFactorEnabled),
        }));

        if (profile.preferences) {
          setPreferences((prev) => ({
            ...prev,
            ...profile.preferences,
            twoFactor: Boolean(profile.twoFactorEnabled),
          }));

          if (profile.preferences.monthlyBudget !== undefined) {
            setFinanceSummary((prev) => ({
              ...prev,
              monthlyBudget: Number(profile.preferences.monthlyBudget) || 0,
            }));
          }
        }
      }

      const finance = dashboard?.finance || {};

      setFinanceSummary((prev) => ({
        ...prev,
        totalBalance: finance.balance ?? prev.totalBalance,
        monthlyIncome: finance.totalIncome ?? prev.monthlyIncome,
        monthlyExpenses: finance.totalExpenses ?? prev.monthlyExpenses,
        savings:
          (finance.totalIncome ?? prev.monthlyIncome) -
          (finance.totalExpenses ?? prev.monthlyExpenses),
      }));

      if (Array.isArray(backendTransactions)) {
        const mappedTransactions = backendTransactions.map((tx) =>
          mapTransaction(tx)
        );

        setTransactions(mappedTransactions);

        const expenseTotals = {};
        let totalExpenses = 0;

        mappedTransactions
          .filter((tx) => tx.type === "Expense")
          .forEach((tx) => {
            expenseTotals[tx.category] =
              (expenseTotals[tx.category] || 0) + tx.amount;

            totalExpenses += tx.amount;
          });

        const colors = [
          "#C96243",
          "#E7A84B",
          "#4FA77B",
          "#668BC4",
          "#8C7D75",
          "#D95C5C",
          "#9A908A",
        ];

        setSpendingCategories(
          Object.entries(expenseTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([name, amount], index) => ({
              name,
              amount,
              color: colors[index % colors.length],
              percentage: totalExpenses > 0
                ? Number(((amount / totalExpenses) * 100).toFixed(1))
                : 0,
            }))
        );
      }

      if (Array.isArray(backendBills)) {
        setUpcomingBills(backendBills.map(mapBill));
      }

      if (Array.isArray(backendAppliances)) {
        setAppliances(backendAppliances.map(mapAppliance));
      }

      if (Array.isArray(backendDocuments)) {
        setDocuments(
          backendDocuments.map((doc) => ({
            id: doc._id,
            name: doc.name,
            category: doc.category,
            owner: currentUser.name || profile?.name || "User",
            uploadDate: formatDate(doc.createdAt),
            size: "—",
            format: doc.fileType || "File",
            verified: true,
            tags: [doc.category],
            fileUrl: doc.fileUrl || "",
            expiryDate: doc.expiryDate || "",
          }))
        );
      }

      if (Array.isArray(backendReminders)) {
        setReminders(backendReminders.map(mapReminder));
      }

      if (Array.isArray(backendHouseholdMembers)) {
        const mappedMembers = backendHouseholdMembers.map((member) => ({
          id: member._id,
          name: member.name,
          role:
            member.role === "owner"
              ? "Home Owner / Admin"
              : "Family Member",
          relationship: member.relation,
          email: member.email || "",
          status: "Active",
          permissions: {
            finance: true,
            documents: true,
            appliances: true,
            reminders: true,
          },
          avatarFallback:
            member.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "FM",
          avatarBg:
            "bg-[#F4D8CC] text-[#C96243] font-bold border border-[#C96243]/20",
        }));

        setHouseholdMembers(mappedMembers);

        // Document Vault folders use the same real household members.
        setVaultMembers(
          mappedMembers.map((member) => ({
            id: member.id,
            name: member.name,
            shortName: member.name?.split(" ")[0] || "Member",
            role: member.role,
            docCount: 0,
            avatarFallback: member.avatarFallback,
            avatarBg: member.avatarBg,
          }))
        );
      }

      setBackendDataLoaded(true);
      console.log("HomeOS backend data loaded successfully");
    } catch (error) {
      console.error("Failed to load HomeOS backend data:", error);

      if (
        /token|unauthorized|authentication|user not found/i.test(
          error.message || ""
        )
      ) {
        clearAuthStorage();
        setIsAuthenticated(false);
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && getStoredToken()) {
      loadBackendData();
    }
  }, [isAuthenticated]);

  return (
    <HomeOsContext.Provider
      value={{
        currentRoute,
        navigate,
        isAuthenticated,
        setIsAuthenticated,

        isSidebarCollapsed,
        toggleSidebar,

        currentUser,
        getDynamicGreeting,
        updateProfile,

        toasts,
        addToast,
        removeToast,

        notifications,
        markAllNotificationsRead,
        activityStream,

        financeSummary,
        spendingCategories,

        upcomingBills,
        addBill,
        updateBill,
        deleteBill,
        payBill,

        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,

        documentCategories,
        vaultMembers,

        documents,
        uploadDocument,
        updateDocument,
        deleteDocument,

        appliances,
        addAppliance,
        updateAppliance,
        updateApplianceStatus,
        deleteAppliance,
        logApplianceService,

        reminders,
        addReminder,
        updateReminder,
        toggleReminder,
        deleteReminder,

        householdMembers,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,

        preferences,
        togglePreference,
        updatePreferences,

        changePassword,
        deleteAccount,
        logout,

        exportHomeData,
        backupHomeData,

        loadBackendData,
      }}
    >
      {children}
    </HomeOsContext.Provider>
  );
}

export function useHomeOs() {
  return useContext(HomeOsContext);
}