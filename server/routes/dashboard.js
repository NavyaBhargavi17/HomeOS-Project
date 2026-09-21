const express = require("express");
const protect = require("../middleware/auth");

const Transaction = require("../models/Transaction");
const Bill = require("../models/Bill");
const Appliance = require("../models/Appliance");
const Document = require("../models/Document");
const Reminder = require("../models/Reminder");
const HouseholdMember = require("../models/HouseholdMember");

const router = express.Router();


// =====================================================
// DASHBOARD SUMMARY
// =====================================================

router.get("/summary", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // ---------------------------------------------------
    // FINANCE
    // ---------------------------------------------------

    const transactions = await Transaction.find({
      user: userId,
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount) || 0;

      if (transaction.type === "income") {
        totalIncome += amount;
      } else if (transaction.type === "expense") {
        totalExpenses += amount;
      }
    });

    const balance = totalIncome - totalExpenses;


    // ---------------------------------------------------
    // BILLS
    // ---------------------------------------------------

    const bills = await Bill.find({
      user: userId,
    });

    const now = new Date();

    let pendingBills = 0;
    let overdueBills = 0;
    let paidBills = 0;

    let pendingBillAmount = 0;
    let overdueBillAmount = 0;
    let paidBillAmount = 0;

    for (const bill of bills) {
      const amount = Number(bill.amount) || 0;

      if (bill.status === "paid") {
        paidBills++;
        paidBillAmount += amount;
      } else if (
        bill.status === "overdue" ||
        (
          bill.status === "pending" &&
          bill.dueDate &&
          new Date(bill.dueDate) < now
        )
      ) {
        overdueBills++;
        overdueBillAmount += amount;
      } else {
        pendingBills++;
        pendingBillAmount += amount;
      }
    }


    // ---------------------------------------------------
    // APPLIANCES
    // ---------------------------------------------------

    const appliances = await Appliance.find({
      user: userId,
    });

    const activeAppliances = appliances.filter(
      (item) => item.status === "active"
    ).length;

    const serviceAppliances = appliances.filter(
      (item) => item.status === "needs_service"
    ).length;

    const inactiveAppliances = appliances.filter(
      (item) => item.status === "inactive"
    ).length;


    // ---------------------------------------------------
    // DOCUMENTS
    // ---------------------------------------------------

    const documents = await Document.find({
      user: userId,
    });

    const expiredDocuments = documents.filter(
      (document) =>
        document.expiryDate &&
        new Date(document.expiryDate) < now
    ).length;

    const expiringDocuments = documents.filter((document) => {
      if (!document.expiryDate) return false;

      const expiry = new Date(document.expiryDate);
      const difference =
        expiry.getTime() - now.getTime();

      const days =
        difference / (1000 * 60 * 60 * 24);

      return days >= 0 && days <= 30;
    }).length;


    // ---------------------------------------------------
    // REMINDERS
    // ---------------------------------------------------

    const reminders = await Reminder.find({
      user: userId,
    });

    const completedReminders = reminders.filter(
      (reminder) => reminder.completed
    ).length;

    const pendingReminders = reminders.filter(
      (reminder) => !reminder.completed
    ).length;

    const overdueReminders = reminders.filter(
      (reminder) =>
        !reminder.completed &&
        reminder.dueDate &&
        new Date(reminder.dueDate) < now
    ).length;


    // ---------------------------------------------------
    // HOUSEHOLD
    // ---------------------------------------------------

    const householdMembers =
      await HouseholdMember.find({
        user: userId,
      });


    // ---------------------------------------------------
    // RECENT TRANSACTIONS
    // ---------------------------------------------------

    const recentTransactions =
      await Transaction.find({
        user: userId,
      })
        .sort({
          date: -1,
          createdAt: -1,
        })
        .limit(5);


    // ---------------------------------------------------
    // UPCOMING BILLS
    // ---------------------------------------------------

    const upcomingBills =
      await Bill.find({
        user: userId,
        status: { $ne: "paid" },
        dueDate: { $gte: now },
      })
        .sort({
          dueDate: 1,
        })
        .limit(5);


    // ---------------------------------------------------
    // UPCOMING REMINDERS
    // ---------------------------------------------------

    const upcomingReminders =
      await Reminder.find({
        user: userId,
        completed: false,
        dueDate: { $gte: now },
      })
        .sort({
          dueDate: 1,
        })
        .limit(5);


    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    res.json({
      finance: {
        totalIncome,
        totalExpenses,
        balance,
        transactionCount: transactions.length,
      },

      bills: {
        total: bills.length,
        pending: pendingBills,
        overdue: overdueBills,
        paid: paidBills,
        pendingAmount: pendingBillAmount,
        overdueAmount: overdueBillAmount,
        paidAmount: paidBillAmount,
      },

      appliances: {
        total: appliances.length,
        active: activeAppliances,
        needsService: serviceAppliances,
        inactive: inactiveAppliances,
      },

      documents: {
        total: documents.length,
        expired: expiredDocuments,
        expiringSoon: expiringDocuments,
      },

      reminders: {
        total: reminders.length,
        pending: pendingReminders,
        completed: completedReminders,
        overdue: overdueReminders,
      },

      household: {
        totalMembers: householdMembers.length,
      },

      recentTransactions,

      upcomingBills,

      upcomingReminders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard summary",
      error: error.message,
    });
  }
});


module.exports = router;