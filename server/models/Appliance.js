const mongoose = require("mongoose");

const applianceSchema = new mongoose.Schema(
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

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    purchaseDate: {
      type: Date,
    },

    nextServiceDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "needs_service", "inactive"],
      default: "active",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appliance", applianceSchema);
