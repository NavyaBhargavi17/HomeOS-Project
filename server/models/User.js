const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      default: "user",
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    // Real Two-Factor Authentication settings
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // Securely stored 6-digit 2FA PIN hash
    twoFactorPinHash: {
      type: String,
      default: null,
      select: false,
    },

    preferences: {
      twoFactor: {
        type: Boolean,
        default: false,
      },

      pushNotifications: {
        type: Boolean,
        default: true,
      },

      emailNotifications: {
        type: Boolean,
        default: true,
      },

      reminderAlerts: {
        type: Boolean,
        default: true,
      },

      aiInsights: {
        type: Boolean,
        default: true,
      },

      dailyBriefing: {
        type: Boolean,
        default: true,
      },

      predictiveMaintenance: {
        type: Boolean,
        default: true,
      },

      spendingInsights: {
        type: Boolean,
        default: true,
      },

      currency: {
        type: String,
        default: "INR",
      },

      language: {
        type: String,
        default: "English",
      },

      dateFormat: {
        type: String,
        default: "DD/MM/YYYY",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);