const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Public API path used by the frontend.
    // Actual access is still protected by authentication.
    fileUrl: {
      type: String,
      default: "",
    },

    // MIME type: application/pdf, image/jpeg, image/png
    fileType: {
      type: String,
      default: "",
    },

    // Original filename uploaded by the user
    fileName: {
      type: String,
      default: "",
      trim: true,
    },

    // Random filename used on the server filesystem
    storedFileName: {
      type: String,
      default: "",
      trim: true,
    },

    // Absolute/relative server-side storage path
    filePath: {
      type: String,
      default: "",
    },

    // File size in bytes
    fileSize: {
      type: Number,
      default: 0,
    },

    expiryDate: {
      type: Date,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);