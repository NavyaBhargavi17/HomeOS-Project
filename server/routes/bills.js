const express = require("express");
const protect = require("../middleware/auth");
const Bill = require("../models/Bill");

const router = express.Router();

// Get all bills for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const bills = await Bill.find({
      user: req.user._id,
    }).sort({ dueDate: 1 });

    res.json(bills);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bills",
    });
  }
});

// Add a bill
router.post("/", protect, async (req, res) => {
  try {
    const { title, amount, category, dueDate, description } = req.body;

    if (!title || amount === undefined || !category || !dueDate) {
      return res.status(400).json({
        message: "Title, amount, category and due date are required",
      });
    }

    const bill = await Bill.create({
      user: req.user._id,
      title,
      amount,
      category,
      dueDate,
      description,
    });

    res.status(201).json({
      message: "Bill added successfully",
      bill,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add bill",
      error: error.message,
    });
  }
});

// Mark a bill as paid
router.patch("/:id/pay", protect, async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    bill.status = "paid";
    await bill.save();

    res.json({
      message: "Bill marked as paid",
      bill,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update bill",
    });
  }
});

module.exports = router;