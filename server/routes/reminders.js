const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/auth");
const Reminder = require("../models/Reminder");

const router = express.Router();

const validPriorities = ["low", "medium", "high"];

// GET ALL REMINDERS
router.get("/", protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({
      user: req.user._id,
    }).sort({
      completed: 1,
      dueDate: 1,
      createdAt: -1,
    });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reminders",
      error: error.message,
    });
  }
});

// ADD REMINDER
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      completed,
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        message: "Title and due date are required",
      });
    }

    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    if (
      priority !== undefined &&
      !validPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message: "Priority must be low, medium, or high",
      });
    }

    const reminder = await Reminder.create({
      user: req.user._id,
      title: title.trim(),
      description: description || "",
      dueDate: parsedDate,
      priority: priority || "medium",
      completed: completed === true,
    });

    res.status(201).json({
      message: "Reminder added successfully",
      reminder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add reminder",
      error: error.message,
    });
  }
});

// EDIT REMINDER
router.patch("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reminder id",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "dueDate",
      "priority",
      "completed",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.title !== undefined) {
      if (!String(updates.title).trim()) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }

      updates.title = String(updates.title).trim();
    }

    if (updates.dueDate !== undefined) {
      const parsedDate = new Date(updates.dueDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid due date",
        });
      }

      updates.dueDate = parsedDate;
    }

    if (
      updates.priority !== undefined &&
      !validPriorities.includes(updates.priority)
    ) {
      return res.status(400).json({
        message: "Priority must be low, medium, or high",
      });
    }

    if (updates.completed !== undefined) {
      updates.completed = Boolean(updates.completed);
    }

    const reminder = await Reminder.findOneAndUpdate(
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

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found",
      });
    }

    res.json({
      message: "Reminder updated successfully",
      reminder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update reminder",
      error: error.message,
    });
  }
});

// TOGGLE REMINDER
router.patch("/:id/toggle", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reminder id",
      });
    }

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found",
      });
    }

    reminder.completed = !reminder.completed;

    await reminder.save();

    res.json({
      message: reminder.completed
        ? "Reminder completed"
        : "Reminder marked as incomplete",
      reminder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to toggle reminder",
      error: error.message,
    });
  }
});

// DELETE REMINDER
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reminder id",
      });
    }

    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found",
      });
    }

    res.json({
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete reminder",
      error: error.message,
    });
  }
});

module.exports = router;