const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/auth");
const Transaction = require("../models/Transaction");

const router = express.Router();

const validTypes = ["income", "expense"];

// =====================================================
// GET ALL TRANSACTIONS
// =====================================================
router.get("/transactions", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
});


// =====================================================
// ADD TRANSACTION
// =====================================================
router.post("/transactions", protect, async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      type,
      date,
      description,
    } = req.body;

    if (!title || amount === undefined || !category || !type) {
      return res.status(400).json({
        message: "Title, amount, category and type are required",
      });
    }

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: "Type must be income or expense",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        message: "Amount must be a valid non-negative number",
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title: title.trim(),
      amount: numericAmount,
      category: category.trim(),
      type,
      date: date || new Date(),
      description: description || "",
    });

    res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add transaction",
      error: error.message,
    });
  }
});


// =====================================================
// UPDATE TRANSACTION
// =====================================================
router.patch("/transactions/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid transaction id",
      });
    }

    const allowedFields = [
      "title",
      "amount",
      "category",
      "type",
      "date",
      "description",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.type && !validTypes.includes(updates.type)) {
      return res.status(400).json({
        message: "Type must be income or expense",
      });
    }

    if (updates.amount !== undefined) {
      const numericAmount = Number(updates.amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount < 0
      ) {
        return res.status(400).json({
          message: "Amount must be a valid non-negative number",
        });
      }

      updates.amount = numericAmount;
    }

    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    if (updates.category !== undefined) {
      updates.category = updates.category.trim();
    }

    const transaction =
      await Transaction.findOneAndUpdate(
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

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update transaction",
      error: error.message,
    });
  }
});


// =====================================================
// DELETE TRANSACTION
// =====================================================
router.delete("/transactions/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid transaction id",
      });
    }

    const transaction =
      await Transaction.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
});


module.exports = router;