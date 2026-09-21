const express = require("express");
const bcrypt = require("bcryptjs");
const protect = require("../middleware/auth");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Bill = require("../models/Bill");
const Appliance = require("../models/Appliance");
const Document = require("../models/Document");
const Reminder = require("../models/Reminder");
const HouseholdMember = require("../models/HouseholdMember");

const router = express.Router();


// =====================================================
// GET PROFILE
// =====================================================

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
});


// =====================================================
// UPDATE PROFILE
// =====================================================

router.patch("/profile", protect, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "phone",
      "role",
      "avatar",
      "address",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.name !== undefined) {
      if (!String(updates.name).trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      updates.name = String(updates.name).trim();
    }

    if (updates.email !== undefined) {
      updates.email = String(updates.email)
        .trim()
        .toLowerCase();

      if (!updates.email) {
        return res.status(400).json({
          message: "Email cannot be empty",
        });
      }

      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email is already in use",
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
});


// =====================================================
// UPDATE PREFERENCES
// =====================================================

router.patch("/preferences", protect, async (req, res) => {
  try {
    const allowedFields = [
      "twoFactor",
      "pushNotifications",
      "emailNotifications",
      "reminderAlerts",
      "aiInsights",
      "dailyBriefing",
      "predictiveMaintenance",
      "spendingInsights",
      "currency",
      "language",
      "dateFormat",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[`preferences.${field}`] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid preferences provided",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Preferences saved successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save preferences",
      error: error.message,
    });
  }
});


// =====================================================
// SETUP 2FA PIN
// =====================================================

router.post("/2fa/setup", protect, async (req, res) => {
  try {
    const { pin, confirmPin } = req.body;

    if (!pin || !confirmPin) {
      return res.status(400).json({
        message: "PIN and confirm PIN are required",
      });
    }

    if (!/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({
        message: "PIN must be exactly 6 digits",
      });
    }

    if (String(pin) !== String(confirmPin)) {
      return res.status(400).json({
        message: "PINs do not match",
      });
    }

    const user = await User.findById(req.user._id).select(
      "+twoFactorPinHash"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        message: "Two-factor authentication is already enabled",
      });
    }

    user.twoFactorPinHash = await bcrypt.hash(
      String(pin),
      10
    );

    user.twoFactorEnabled = true;

    if (!user.preferences) {
      user.preferences = {};
    }

    user.preferences.twoFactor = true;

    await user.save();

    res.json({
      message: "Two-factor authentication enabled successfully",
      twoFactorEnabled: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to setup two-factor authentication",
      error: error.message,
    });
  }
});


// =====================================================
// CHANGE 2FA PIN
// =====================================================

router.patch("/2fa/pin", protect, async (req, res) => {
  try {
    const {
      currentPin,
      newPin,
      confirmPin,
    } = req.body;

    if (!currentPin || !newPin || !confirmPin) {
      return res.status(400).json({
        message:
          "Current PIN, new PIN and confirm PIN are required",
      });
    }

    if (!/^\d{6}$/.test(String(currentPin))) {
      return res.status(400).json({
        message: "Current PIN must be exactly 6 digits",
      });
    }

    if (!/^\d{6}$/.test(String(newPin))) {
      return res.status(400).json({
        message: "New PIN must be exactly 6 digits",
      });
    }

    if (String(newPin) !== String(confirmPin)) {
      return res.status(400).json({
        message: "New PINs do not match",
      });
    }

    const user = await User.findById(req.user._id).select(
      "+twoFactorPinHash"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.twoFactorEnabled || !user.twoFactorPinHash) {
      return res.status(400).json({
        message: "Two-factor authentication is not enabled",
      });
    }

    const currentPinMatches = await bcrypt.compare(
      String(currentPin),
      user.twoFactorPinHash
    );

    if (!currentPinMatches) {
      return res.status(400).json({
        message: "Current PIN is incorrect",
      });
    }

    user.twoFactorPinHash = await bcrypt.hash(
      String(newPin),
      10
    );

    await user.save();

    res.json({
      message: "Two-factor PIN changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change two-factor PIN",
      error: error.message,
    });
  }
});


// =====================================================
// DISABLE 2FA
// =====================================================

router.post("/2fa/disable", protect, async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({
        message: "2FA PIN is required",
      });
    }

    if (!/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({
        message: "PIN must be exactly 6 digits",
      });
    }

    const user = await User.findById(req.user._id).select(
      "+twoFactorPinHash"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.twoFactorEnabled || !user.twoFactorPinHash) {
      return res.status(400).json({
        message: "Two-factor authentication is not enabled",
      });
    }

    const pinMatches = await bcrypt.compare(
      String(pin),
      user.twoFactorPinHash
    );

    if (!pinMatches) {
      return res.status(400).json({
        message: "Incorrect 2FA PIN",
      });
    }

    user.twoFactorEnabled = false;
    user.twoFactorPinHash = null;

    if (!user.preferences) {
      user.preferences = {};
    }

    user.preferences.twoFactor = false;

    await user.save();

    res.json({
      message: "Two-factor authentication disabled successfully",
      twoFactorEnabled: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to disable two-factor authentication",
      error: error.message,
    });
  }
});


// =====================================================
// CHANGE PASSWORD
// =====================================================

router.patch("/password", protect, async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change password",
      error: error.message,
    });
  }
});


// =====================================================
// DELETE ACCOUNT
// =====================================================

router.delete("/account", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all user-owned data
    await Promise.all([
      Transaction.deleteMany({
        user: userId,
      }),

      Bill.deleteMany({
        user: userId,
      }),

      Appliance.deleteMany({
        user: userId,
      }),

      Document.deleteMany({
        user: userId,
      }),

      Reminder.deleteMany({
        user: userId,
      }),

      HouseholdMember.deleteMany({
        user: userId,
      }),

      User.deleteOne({
        _id: userId,
      }),
    ]);

    res.json({
      message:
        "Account and associated household data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete account",
      error: error.message,
    });
  }
});


module.exports = router;