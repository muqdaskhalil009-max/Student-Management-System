const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Student Management System API is running!",
    status: "Success",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is working correctly.",
  });
});

// Student routes
app.use("/api/students", studentRoutes);

// Connect MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();