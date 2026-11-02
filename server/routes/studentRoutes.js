const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");

const router = express.Router();

// GET: All students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Add a new student
router.post("/", async (req, res) => {
  try {
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
      return res.status(400).json({
        message: "Name, email and course are required.",
      });
    }

    const student = await Student.create({ name, email, course });
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    res.status(500).json({ message: error.message });
  }
});

// PUT: Update a student
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const { name, email, course } = req.body;

    if (!name || !email || !course) {
      return res.status(400).json({
        message: "Name, email and course are required.",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, course },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(200).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    res.status(500).json({ message: error.message });
  }
});

// DELETE: Remove a student
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;