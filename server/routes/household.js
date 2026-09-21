const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/auth");
const HouseholdMember = require("../models/HouseholdMember");

const router = express.Router();

// GET ALL HOUSEHOLD MEMBERS
router.get("/members", protect, async (req, res) => {
  try {
    const members = await HouseholdMember.find({
      user: req.user._id,
    }).sort({
      createdAt: 1,
    });

    res.json(members);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch household members",
      error: error.message,
    });
  }
});

// ADD HOUSEHOLD MEMBER
router.post("/members", protect, async (req, res) => {
  try {
    const {
      name,
      relation,
      email,
      role,
    } = req.body;

    if (!name || !relation) {
      return res.status(400).json({
        message: "Name and relation are required",
      });
    }

    const validRoles = ["owner", "member"];

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        message: "Role must be owner or member",
      });
    }

    const member = await HouseholdMember.create({
      user: req.user._id,
      name: name.trim(),
      relation: relation.trim(),
      email: email ? email.trim().toLowerCase() : "",
      role: role || "member",
    });

    res.status(201).json({
      message: "Household member added successfully",
      member,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add household member",
      error: error.message,
    });
  }
});

// EDIT HOUSEHOLD MEMBER
router.patch("/members/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid household member id",
      });
    }

    const allowedFields = [
      "name",
      "relation",
      "email",
      "role",
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

    if (updates.relation !== undefined) {
      if (!String(updates.relation).trim()) {
        return res.status(400).json({
          message: "Relation cannot be empty",
        });
      }

      updates.relation = String(updates.relation).trim();
    }

    if (updates.email !== undefined) {
      updates.email = String(updates.email).trim().toLowerCase();
    }

    if (
      updates.role !== undefined &&
      !["owner", "member"].includes(updates.role)
    ) {
      return res.status(400).json({
        message: "Role must be owner or member",
      });
    }

    const member = await HouseholdMember.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!member) {
      return res.status(404).json({
        message: "Household member not found",
      });
    }

    res.json({
      message: "Household member updated successfully",
      member,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update household member",
      error: error.message,
    });
  }
});

// DELETE HOUSEHOLD MEMBER
router.delete("/members/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid household member id",
      });
    }

    const member = await HouseholdMember.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!member) {
      return res.status(404).json({
        message: "Household member not found",
      });
    }

    res.json({
      message: "Household member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete household member",
      error: error.message,
    });
  }
});

module.exports = router;