const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/auth");
const Appliance = require("../models/Appliance");

const router = express.Router();

const validStatuses = ["active", "needs_service", "inactive"];

// GET ALL APPLIANCES
router.get("/", protect, async (req, res) => {
  try {
    const appliances = await Appliance.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(appliances);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch appliances",
      error: error.message,
    });
  }
});

// ADD APPLIANCE
router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      purchaseDate,
      nextServiceDate,
      status,
      notes,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Name and category are required",
      });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid appliance status",
      });
    }

    const appliance = await Appliance.create({
      user: req.user._id,
      name: name.trim(),
      category: category.trim(),
      brand: brand ? brand.trim() : "",
      purchaseDate: purchaseDate || undefined,
      nextServiceDate: nextServiceDate || undefined,
      status: status || "active",
      notes: notes || "",
    });

    res.status(201).json({
      message: "Appliance added successfully",
      appliance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add appliance",
      error: error.message,
    });
  }
});

// EDIT APPLIANCE
router.patch("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid appliance id",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "brand",
      "purchaseDate",
      "nextServiceDate",
      "status",
      "notes",
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

    if (updates.category !== undefined) {
      if (!String(updates.category).trim()) {
        return res.status(400).json({
          message: "Category cannot be empty",
        });
      }

      updates.category = String(updates.category).trim();
    }

    if (updates.brand !== undefined) {
      updates.brand = String(updates.brand).trim();
    }

    if (
      updates.status !== undefined &&
      !validStatuses.includes(updates.status)
    ) {
      return res.status(400).json({
        message: "Invalid appliance status",
      });
    }

    const appliance = await Appliance.findOneAndUpdate(
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

    if (!appliance) {
      return res.status(404).json({
        message: "Appliance not found",
      });
    }

    res.json({
      message: "Appliance updated successfully",
      appliance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update appliance",
      error: error.message,
    });
  }
});

// UPDATE APPLIANCE STATUS
router.patch("/:id/status", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid appliance id",
      });
    }

    const { status } = req.body;

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Status must be active, needs_service, or inactive",
      });
    }

    const appliance = await Appliance.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appliance) {
      return res.status(404).json({
        message: "Appliance not found",
      });
    }

    res.json({
      message: "Appliance status updated successfully",
      appliance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update appliance status",
      error: error.message,
    });
  }
});

// DELETE APPLIANCE
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid appliance id",
      });
    }

    const appliance = await Appliance.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!appliance) {
      return res.status(404).json({
        message: "Appliance not found",
      });
    }

    res.json({
      message: "Appliance deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete appliance",
      error: error.message,
    });
  }
});

module.exports = router;