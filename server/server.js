const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const financeRoutes = require("./routes/finance");
const billRoutes = require("./routes/bills");
const applianceRoutes = require("./routes/appliances");
const documentRoutes = require("./routes/documents");
const reminderRoutes = require("./routes/reminders");
const householdRoutes = require("./routes/household");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://10.150.90.218:5173",
       "https://home-os-project.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/appliances", applianceRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/household", householdRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "HomeOS Backend is running 🚀",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`HomeOS server running on http://localhost:${PORT}`);
  console.log(
    `HomeOS network server running on http://10.150.90.218:${PORT}`
  );
});