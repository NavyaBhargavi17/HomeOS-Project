const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
/*const nodemailer = require("nodemailer");
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});*/
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const User = require("../models/User");

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);


// ==========================================
// AUTH HELPERS
// ==========================================

// Verify a normal JWT and return the user
const getAuthenticatedUser = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return null;
    }

    const user = await User.findById(decoded.userId);

    return user || null;
  } catch (error) {
    return null;
  }
};


// ==========================================
// REGISTER
// ==========================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Send response
    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});


// ==========================================
// LOGIN
// ==========================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+twoFactorPinHash");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // 2FA CHECK
    // ==========================================

    if (user.twoFactorEnabled) {
      // Make sure a PIN actually exists
      if (!user.twoFactorPinHash) {
        return res.status(400).json({
          message:
            "Two-factor authentication is enabled but no PIN is configured",
        });
      }

      // Create a short-lived temporary token.
      // This is NOT the normal login token.
      const twoFactorToken = jwt.sign(
        {
          userId: user._id,
          purpose: "2fa-login",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
        }
      );

      return res.json({
        message: "Two-factor authentication required",
        requiresTwoFactor: true,
        twoFactorToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    // ==========================================
    // NORMAL LOGIN
    // ==========================================

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Send response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});


// ==========================================
// GOOGLE SIGN-IN
// ==========================================
// Verifies a Google Identity Services ID token,
// creates the HomeOS user if needed, then issues
// the normal HomeOS JWT.
// ==========================================

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message: "Google Sign-In is not configured on the server",
      });
    }

    // Verify the credential came from Google and is
    // intended for this application's Google Client ID.
    let ticket;

    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      console.error("Google token verification error:", error);

      return res.status(401).json({
        message: "Invalid Google credential",
      });
    }

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: "Invalid Google account information",
      });
    }

    const googleEmail = String(payload.email || "")
      .trim()
      .toLowerCase();

    const googleName =
      String(payload.name || "").trim() ||
      "HomeOS User";

    const googlePicture =
      String(payload.picture || "").trim();

    const emailVerified = payload.email_verified === true;

    if (!googleEmail || !emailVerified) {
      return res.status(401).json({
        message: "Google email could not be verified",
      });
    }

    // Find an existing HomeOS account by email.
    let user = await User.findOne({
      email: googleEmail,
    }).select("+twoFactorPinHash");

    // Create a HomeOS account automatically for a new
    // Google user. A random password is stored because
    // the current User schema requires a password.
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");

      const hashedPassword = await bcrypt.hash(
        randomPassword,
        10
      );

      user = await User.create({
        name: googleName,
        email: googleEmail,
        password: hashedPassword,
        avatar: googlePicture,
      });

      // Re-fetch with the PIN hash explicitly available
      // so the same 2FA flow works for new Google users
      // if 2FA is enabled later.
      user = await User.findById(user._id).select(
        "+twoFactorPinHash"
      );
    } else if (
      googlePicture &&
      !user.avatar
    ) {
      // Save the Google profile picture only when the
      // existing account does not already have an avatar.
      user.avatar = googlePicture;
      await user.save();
    }

    // ==========================================
    // 2FA CHECK
    // ==========================================

    if (user.twoFactorEnabled) {
      if (!user.twoFactorPinHash) {
        return res.status(400).json({
          message:
            "Two-factor authentication is enabled but no PIN is configured",
        });
      }

      const twoFactorToken = jwt.sign(
        {
          userId: user._id,
          purpose: "2fa-login",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
        }
      );

      return res.json({
        message: "Two-factor authentication required",
        requiresTwoFactor: true,
        twoFactorToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    // ==========================================
    // NORMAL GOOGLE LOGIN
    // ==========================================

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error);

    res.status(500).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
});


// ==========================================
// 2FA SETUP
// ==========================================
// Creates a manually chosen 6-digit PIN.
// The PIN is stored as a bcrypt hash.
// ==========================================

router.post("/2fa/setup", async (req, res) => {
  try {
    const {
      pin,
      confirmPin,
    } = req.body;

    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // If already enabled, don't create another PIN
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        message: "Two-factor authentication is already enabled",
      });
    }

    // Validate PIN
    if (!pin || !confirmPin) {
      return res.status(400).json({
        message: "PIN and confirm PIN are required",
      });
    }

    // PIN must contain exactly 6 digits
    if (!/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({
        message: "PIN must be exactly 6 digits",
      });
    }

    // Confirm PIN
    if (String(pin) !== String(confirmPin)) {
      return res.status(400).json({
        message: "PINs do not match",
      });
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(
      String(pin),
      10
    );

    user.twoFactorPinHash = hashedPin;
    user.twoFactorEnabled = true;

    // Keep existing frontend preference synchronized
    if (!user.preferences) {
      user.preferences = {};
    }

    user.preferences.twoFactor = true;

    await user.save();

    res.json({
      message:
        "Two-factor authentication enabled successfully",
      twoFactorEnabled: true,
    });
  } catch (error) {
    console.error("2FA setup error:", error);

    res.status(500).json({
      message:
        "Failed to setup two-factor authentication",
      error: error.message,
    });
  }
});


// ==========================================
// CHANGE 2FA PIN
// ==========================================

router.patch("/2fa/pin", async (req, res) => {
  try {
    const {
      currentPin,
      newPin,
      confirmPin,
    } = req.body;

    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (
      !currentPin ||
      !newPin ||
      !confirmPin
    ) {
      return res.status(400).json({
        message:
          "Current PIN, new PIN and confirm PIN are required",
      });
    }

    // Validate current PIN
    if (!/^\d{6}$/.test(String(currentPin))) {
      return res.status(400).json({
        message:
          "Current PIN must be exactly 6 digits",
      });
    }

    // Validate new PIN
    if (!/^\d{6}$/.test(String(newPin))) {
      return res.status(400).json({
        message:
          "New PIN must be exactly 6 digits",
      });
    }

    // Confirm new PIN
    if (String(newPin) !== String(confirmPin)) {
      return res.status(400).json({
        message: "New PINs do not match",
      });
    }

    // Get PIN hash explicitly
    const userWithPin = await User.findById(
      user._id
    ).select("+twoFactorPinHash");

    if (
      !userWithPin ||
      !userWithPin.twoFactorEnabled ||
      !userWithPin.twoFactorPinHash
    ) {
      return res.status(400).json({
        message:
          "Two-factor authentication is not enabled",
      });
    }

    // Verify current PIN
    const currentPinMatch = await bcrypt.compare(
      String(currentPin),
      userWithPin.twoFactorPinHash
    );

    if (!currentPinMatch) {
      return res.status(400).json({
        message: "Current PIN is incorrect",
      });
    }

    // Hash new PIN
    userWithPin.twoFactorPinHash =
      await bcrypt.hash(
        String(newPin),
        10
      );

    await userWithPin.save();

    res.json({
      message:
        "Two-factor PIN changed successfully",
    });
  } catch (error) {
    console.error(
      "2FA PIN change error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to change two-factor PIN",
      error: error.message,
    });
  }
});


// ==========================================
// VERIFY 2FA DURING LOGIN
// ==========================================

router.post("/2fa/verify-login", async (req, res) => {
  try {
    const {
      twoFactorToken,
      pin,
    } = req.body;

    if (!twoFactorToken || !pin) {
      return res.status(400).json({
        message:
          "Two-factor token and PIN are required",
      });
    }

    // PIN must contain exactly 6 digits
    if (!/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({
        message: "PIN must be exactly 6 digits",
      });
    }

    // Verify temporary login token
    let decoded;

    try {
      decoded = jwt.verify(
        twoFactorToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message:
          "Two-factor authentication session expired",
      });
    }

    if (
      !decoded.userId ||
      decoded.purpose !== "2fa-login"
    ) {
      return res.status(401).json({
        message:
          "Invalid two-factor authentication session",
      });
    }

    // Find user and explicitly include PIN hash
    const user = await User.findById(
      decoded.userId
    ).select("+twoFactorPinHash");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (
      !user.twoFactorEnabled ||
      !user.twoFactorPinHash
    ) {
      return res.status(400).json({
        message:
          "Two-factor authentication is not enabled",
      });
    }

    // Verify PIN
    const pinMatch = await bcrypt.compare(
      String(pin),
      user.twoFactorPinHash
    );

    if (!pinMatch) {
      return res.status(401).json({
        message: "Invalid 2FA PIN",
      });
    }

    // ==========================================
    // GENERATE REAL LOGIN JWT
    // ==========================================

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "2FA login verification error:",
      error
    );

    res.status(500).json({
      message:
        "Two-factor authentication failed",
      error: error.message,
    });
  }
});


// ==========================================
// DISABLE 2FA
// ==========================================

router.post("/2fa/disable", async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({
        message: "2FA PIN is required",
      });
    }

    // PIN must contain exactly 6 digits
    if (!/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({
        message: "PIN must be exactly 6 digits",
      });
    }

    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Get PIN hash explicitly
    const userWithPin = await User.findById(
      user._id
    ).select("+twoFactorPinHash");

    if (
      !userWithPin ||
      !userWithPin.twoFactorEnabled ||
      !userWithPin.twoFactorPinHash
    ) {
      return res.status(400).json({
        message:
          "Two-factor authentication is not enabled",
      });
    }

    // Verify current PIN
    const pinMatch = await bcrypt.compare(
      String(pin),
      userWithPin.twoFactorPinHash
    );

    if (!pinMatch) {
      return res.status(400).json({
        message: "Incorrect 2FA PIN",
      });
    }

    // Disable 2FA
    userWithPin.twoFactorEnabled = false;
    userWithPin.twoFactorPinHash = null;

    // Keep existing frontend preference synchronized
    if (!userWithPin.preferences) {
      userWithPin.preferences = {};
    }

    userWithPin.preferences.twoFactor = false;

    await userWithPin.save();

    res.json({
      message:
        "Two-factor authentication disabled successfully",
      twoFactorEnabled: false,
    });
  } catch (error) {
    console.error(
      "2FA disable error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to disable two-factor authentication",
      error: error.message,
    });
  }
});
// ==================== FORGOT PASSWORD ====================

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    // Always return the same response so we don't reveal
    // whether an email is registered.
    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, a verification code has been sent.",
      });
    }

    // Generate a 6-digit verification code
    const resetCode = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Hash the code before storing it
    const hashedCode = await bcrypt.hash(resetCode, 10);

    user.resetPasswordCode = hashedCode;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // Send reset email using Brevo API
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "HomeOS",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: user.email,
          },
        ],
        subject: "HomeOS Password Reset Code",
        textContent: `Your HomeOS password reset code is ${resetCode}. This code will expire in 10 minutes.`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
            <h2>HomeOS Password Reset</h2>

            <p>We received a request to reset your HomeOS password.</p>

            <p>Your verification code is:</p>

            <div style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 15px;
              text-align: center;
              background: #f3f4f6;
              border-radius: 10px;
            ">
              ${resetCode}
            </div>

            <p>
              This code will expire in
              <strong>10 minutes</strong>.
            </p>

            <p>
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <p>— HomeOS Team</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Failed to send reset email");
    }

    return res.json({
      message: "If an account exists with this email, a verification code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Unable to process password reset request.",
    });
  }
});

// ==================== RESET PASSWORD ====================

router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        message: "Email, verification code, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }
    

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+resetPasswordCode +resetPasswordExpires");

    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      return res.status(400).json({
        message: "Invalid or expired verification code.",
      });
    }

    // Check whether the code has expired
    if (user.resetPasswordExpires < new Date()) {
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(400).json({
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // Compare entered code with stored hashed code
    const isCodeValid = await bcrypt.compare(
      code.toString(),
      user.resetPasswordCode
    );

    if (!isCodeValid) {
      return res.status(400).json({
        message: "Invalid verification code.",
      });
    }

    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);

    // Invalidate the reset code after successful password reset
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Unable to reset password.",
    });
  }
});

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;