const mongoose = require("mongoose");
const Task = require("../models/Task");

//  ADD
exports.addTask = async (req, res) => {
  try {
        console.log("REQ BODY:", req.body);

    const task = new Task(req.body);
    const saved = await task.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  GET ALL
exports.getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      project,
      assignedTo,
      search
    } = req.query;

    let filter = {};

    // Filters
    if (status) filter.status = status;
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Search 
    if (search) {
      filter.$or = [
        { ticket: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("assignedBy", "name")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      data: tasks,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  GET BY ID
exports.getTaskById = async (req, res) => {
  try {
    const data = await Task.findById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  UPDATE
exports.updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//TaskAnalytics:
exports.getTaskAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;

    const stats = await Task.aggregate([
      {
        $match: { assignedBy: mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0
    };

    stats.forEach(s => {
      result.total += s.count;
      if (s._id === "Completed") result.completed = s.count;
      if (s._id === "Pending") result.pending = s.count;
      if (s._id === "In Progress") result.inProgress = s.count;
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};