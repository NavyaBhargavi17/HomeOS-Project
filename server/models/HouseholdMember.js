const mongoose = require("mongoose");

const householdMemberSchema = new mongoose.Schema(
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

    relation: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["owner", "member"],
      default: "member",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HouseholdMember", householdMemberSchema);