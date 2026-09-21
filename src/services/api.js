const API_URL = "http://10.150.90.218:5000/api";
// =========================
// AUTH TOKEN
// =========================

const getToken = () => {
  return (
    localStorage.getItem("homeos_token") ||
    sessionStorage.getItem("homeos_token")
  );
};

// =========================
// JSON REQUEST
// =========================

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      message: text || "Something went wrong",
    };
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// =========================
// MULTIPART / FILE REQUEST
// =========================

const multipartRequest = async (endpoint, formData, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      message: text || "Something went wrong",
    };
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// =========================
// API
// =========================

export const api = {
  // =========================
  // AUTH
  // =========================

  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // =========================
  // TWO-FACTOR AUTHENTICATION
  // =========================

  setupTwoFactor: (pin, confirmPin) =>
    request("/auth/2fa/setup", {
      method: "POST",
      body: JSON.stringify({ pin, confirmPin }),
    }),

  verifyTwoFactorLogin: (twoFactorToken, pin) =>
    request("/auth/2fa/verify-login", {
      method: "POST",
      body: JSON.stringify({ twoFactorToken, pin }),
    }),

  changeTwoFactorPin: (currentPin, newPin, confirmPin) =>
    request("/auth/2fa/pin", {
      method: "PATCH",
      body: JSON.stringify({ currentPin, newPin, confirmPin }),
    }),

  disableTwoFactor: (pin) =>
    request("/auth/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ pin }),
    }),

  // =========================
  // USER
  // =========================

  getProfile: () =>
    request("/user/profile"),

  updateProfile: (data) =>
    request("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updatePreferences: (data) =>
    request("/user/preferences", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword, newPassword) =>
    request("/user/password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    }),

  deleteAccount: () =>
    request("/user/account", {
      method: "DELETE",
    }),

  // =========================
  // DASHBOARD
  // =========================

  getDashboard: () =>
    request("/dashboard/summary"),

  // =========================
  // FINANCE / TRANSACTIONS
  // =========================

  getTransactions: () =>
    request("/finance/transactions"),

  addTransaction: (data) =>
    request("/finance/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTransaction: (id, data) =>
    request(`/finance/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteTransaction: (id) =>
    request(`/finance/transactions/${id}`, {
      method: "DELETE",
    }),

  // =========================
  // BILLS
  // =========================

  getBills: () =>
    request("/bills"),

  addBill: (data) =>
    request("/bills", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateBill: (id, data) =>
    request(`/bills/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  payBill: (id) =>
    request(`/bills/${id}/pay`, {
      method: "PATCH",
    }),

  deleteBill: (id) =>
    request(`/bills/${id}`, {
      method: "DELETE",
    }),

  // =========================
  // APPLIANCES
  // =========================

  getAppliances: () =>
    request("/appliances"),

  addAppliance: (data) =>
    request("/appliances", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateAppliance: (id, data) =>
    request(`/appliances/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateApplianceStatus: (id, status) =>
    request(`/appliances/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }),

  deleteAppliance: (id) =>
    request(`/appliances/${id}`, {
      method: "DELETE",
    }),

  // =========================
  // DOCUMENTS
  // =========================

  getDocuments: () =>
    request("/documents"),

  // Normal metadata-only document creation
  addDocument: (data) =>
    request("/documents", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // REAL FILE UPLOAD
  uploadDocument: (file, metadata = {}) => {
    const formData = new FormData();

    formData.append("file", file);

    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return multipartRequest("/documents/upload", formData, {
      method: "POST",
    });
  },

  // Update document metadata
  updateDocument: (id, data) =>
    request(`/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Delete document + stored file
  deleteDocument: (id) =>
    request(`/documents/${id}`, {
      method: "DELETE",
    }),

  // Download / view document file
  downloadDocument: async (id) => {
    const token = getToken();

    const response = await fetch(
      `${API_URL}/documents/${id}/file`,
      {
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    if (!response.ok) {
      let message = "Failed to download document";

      try {
        const data = await response.json();
        message = data.message || message;
      } catch {
        // Ignore JSON parsing error
      }

      throw new Error(message);
    }

    const blob = await response.blob();

    const contentDisposition =
      response.headers.get("Content-Disposition");

    let fileName = "document";

    if (contentDisposition) {
      const match = contentDisposition.match(
        /filename="?([^"]+)"?/i
      );

      if (match && match[1]) {
        fileName = match[1];
      }
    }

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  },

  // =========================
  // REMINDERS
  // =========================

  getReminders: () =>
    request("/reminders"),

  addReminder: (data) =>
    request("/reminders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateReminder: (id, data) =>
    request(`/reminders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  toggleReminder: (id) =>
    request(`/reminders/${id}/toggle`, {
      method: "PATCH",
    }),

  deleteReminder: (id) =>
    request(`/reminders/${id}`, {
      method: "DELETE",
    }),

  // =========================
  // HOUSEHOLD
  // =========================

  getHouseholdMembers: () =>
    request("/household/members"),

  addHouseholdMember: (data) =>
    request("/household/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateHouseholdMember: (id, data) =>
    request(`/household/members/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteHouseholdMember: (id) =>
    request(`/household/members/${id}`, {
      method: "DELETE",
    }),
};