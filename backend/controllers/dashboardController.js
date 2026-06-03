const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

//GET DATA

exports.getDashboardData = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const role = req.user.role;

    let tasks = [];
    let projects = [];
    let leaves = [];

    // ROLE BASED LOGIC

    if (role === "admin") {
//  ADMIN (ALL DATA)
      tasks = await Task.find();
      projects = await Project.find();
      leaves = await Leave.find();

    } else if (role === "manager") {
  //  MANAGER (PROJECTS)
      projects = await Project.find({
        manager: userId
      });

      const projectIds = projects.map(p => p._id);

      tasks = await Task.find({
        project: { $in: projectIds }
      });

      leaves = await Leave.find({
        employeeId: userId
      });

    } else {
      //  EMPLOYEE (ONLY THEIR DATA)
      tasks = await Task.find({
        $or: [
          { assignedTo: userId },
          { assignedBy: userId }
        ]
      });

      projects = await Project.find({
        employees: { $in: [userId] }
      });

      leaves = await Leave.find({
        employeeId: userId
      });
    }

    // STATS CALCULATION

    const taskStats = {
      completed: tasks.filter(t => t.status === "Completed").length,
      pending: tasks.filter(t => t.status === "Pending").length,
      inProgress: tasks.filter(t => t.status === "In Progress").length
    };

    const projectStats = {
      completed: projects.filter(p => p.status === "Completed").length,
      pending: projects.filter(p => p.status === "Pending").length,
      inProgress: projects.filter(p => p.status === "In Progress").length
    };

    const leaveStats = {
      approved: leaves.filter(l => l.status === "Approved").length,
      pending: leaves.filter(l => l.status === "Pending").length
    };


    const totalEmployees = await Employee.countDocuments();

  
// RESPONSE (ROLE BASED)

if (role === "employee") {
  return res.json({
    tasks: taskStats,
    leaves: leaveStats
  });
}
    res.json({
      tasks: taskStats,
      projects: projectStats,
      leaves: leaveStats,
      totalEmployees,
      upcomingProjects: projectStats.pending
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Dashboard error" });
  }
};