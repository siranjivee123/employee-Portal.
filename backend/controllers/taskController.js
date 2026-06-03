const mongoose = require("mongoose");
const Task = require("../models/Task");
const Employee = require("../models/Employee");
const Project = require("../models/Project");

// ADD TASK
exports.addTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    const saved = await task.save();

    const { assignedTo, project } = saved;

    //  Add task to employee
    if (assignedTo) {
      await Employee.findByIdAndUpdate(assignedTo, {
        $addToSet: { tasks: saved._id }
      });
    }

    //  Add employee to project
   if (project) {
  await Project.findByIdAndUpdate(
    project,
    {
      $addToSet: {
        tasks: saved._id,
        employees: assignedTo
      }
    }
  );
}
    //link task to project 
    await Project.findByIdAndUpdate(project, {
      $addToSet: { tasks: saved._id }   
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  GET ALL
/*exports.getTasks = async (req, res) => {
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
};*/

/*exports.getTasks = async (req, res) => {
  try {

    const { role, userId } = req.query;

    let filter = {};

    // ADMIN → all tasks
    if (role === "Admin") {
      filter = {};
    }

    // EMPLOYEE / MANAGER → only their tasks
    else {
      filter = {
        $or: [
          { assignedTo: userId },
          { assignedBy: userId }
        ]
      };
    }*/

  exports.getTasks = async (req, res) => {
  try {
    const { role, userId } = req.query;

    let match = {};

    // ADMIN → see all
    if (role === "admin") {
      match = {};
    }

    // EMPLOYEE TO only assigned tasks
    else if (role === "employee") {
      match.assignedTo = new mongoose.Types.ObjectId(userId);
    }

    // MANAGER TO tasks of employees in projects
    else if (role === "manager") {

      const projects = await Project.find({
        manager: new mongoose.Types.ObjectId(userId)
      }).select("_id");

      const projectIds = projects.map(p => p._id);

      match.project = { $in: projectIds };
    }

    const tasks = await Task.find(match)
      .populate("assignedTo", "name")
      .populate("assignedBy", "name")
      .populate("project", "name");

    res.json({ data: tasks });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

   

exports.getTasksByEmployeeProjects = async (req, res) => {
  try {
    const empId = req.params.empId;

    const employee = await Employee.findById(empId).select("projects");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const tasks = await Task.find({
      $or: [
        { assignedTo: empId },
        { project: { $in: employee.projects } }
      ]
    })
    .populate("project", "name")
    .populate("assignedTo", "name")
    .populate("assignedBy", "name");

    res.json(tasks);

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


// GET TASKS BY EMPLOYEE
exports.getTasksByEmployee = async (req, res) => {
  try {
    const empId = req.params.empId;

    const tasks = await Task.find({ assignedTo: empId })
     .populate("assignedTo", "name")
      
      .populate("assignedBy", "name")
.populate("project", "name");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  UPDATE
exports.updateTask = async (req, res) => {
  try {
    const { role } = req.query;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can update' });
    }

    
    const oldTask = await Task.findById(req.params.id);

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (oldTask.assignedTo && oldTask.assignedTo.toString() !== updated.assignedTo?.toString()) {
      await Employee.findByIdAndUpdate(oldTask.assignedTo, {
        $pull: { tasks: oldTask._id }
      });
    }

    // add new employee 
    if (updated.assignedTo) {
      await Employee.findByIdAndUpdate(updated.assignedTo, {
        $addToSet: { tasks: updated._id }
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteTask = async (req, res) => {
  try {
    const { role } = req.query;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete' });
    }
   

    const task = await Task.findById(req.params.id);
    
    // Remove task from Employee
    if (task.assignedTo) {
      await Employee.findByIdAndUpdate(task.assignedTo, {
        $pull: { tasks: task._id }
      });
    }

    // Remove task from Project
    if (task.project) {
      await Project.findByIdAndUpdate(task.project, {
        $pull: { tasks: task._id }
      });
    }

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