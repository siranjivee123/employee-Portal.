const mongoose = require("mongoose");
const Project = require("../models/Project");

/* ADD PROJECT */
exports.addProject = async (req, res) => {
  try {
    console.log("PROJECT API HIT");
    console.log("BODY:", req.body);

    const {
      name,
      description,
      category,
      status,
      manager,
      employees
    } = req.body;

    const project = new Project({
      name,
      description,
      category,
      status,
      manager,   
      employees   
    });

    await project.save();
     const Employee = require("../models/Employee");

    if (employees && employees.length > 0) {
      await Employee.updateMany(
        { _id: { $in: employees } },
        { $addToSet: { projects: project._id } }
      );
    }

    res.status(201).json({
      message: "Project added successfully",
      project
    });

  } catch (err) {
    console.error("ADD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* GET ALL 
exports.getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search
    } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const projects = await Project.find(filter)
      .populate("employees", "name")
      .populate("manager", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Project.countDocuments(filter);

    res.json({
      data: projects,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};*/

/*exports.getProjects = async (req, res) => {
  try {

    const { role, userId, page = 1, limit = 10, status, category, search } = req.query;

    let filter = {};

    // ADMIN → all projects
    if (role === "Admin") {
      filter = {};
    }

    // EMPLOYEE / MANAGER → only assigned projects
    else {
      filter = {
        $or: [
          { manager: userId },
          { employees: userId }
        ]
      };
    }

    if (status) filter.status = status;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const projects = await Project.find(filter)
      .populate("employees", "name")
      .populate("manager", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Project.countDocuments(filter);

    res.json({
      data: projects,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};*/


exports.getProjects = async (req, res) => {
  try {

    const { role, userId } = req.query;

    let filter = {};

    if (role === "admin") {
      filter = {};
    }

    else if (role === "manager") {
      filter.manager =  new mongoose.Types.ObjectId(userId);
    }

    else if (role === "employee") {
      filter.employees = new mongoose.Types.ObjectId(userId);
    }

    const projects = await Project.find(filter)
      .populate("employees", "name")
      .populate("manager", "name");

    res.json({ data: projects });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET by id */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
     .populate('employees', 'name')   
  .populate('manager', 'name'); 
    res.status(200).json({ data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getProjectsByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const projects = await Project.find({
      employees: employeeId
    }).select("name status");

    res.json(projects);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
exports.updateProject = async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      req.body, 
      { new: true }
    );

    res.status(200).json({
      message: "Project updated",
      project: updated
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE */
exports.deleteProject = async (req, res) => {
  try {

     const role = (req.query.role || '').toLowerCase();
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Project deleted"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// controllers


exports.getProjectAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;

    const stats = await Project.aggregate([
      {
        $match: {
          $or: [
            { manager: mongoose.Types.ObjectId(userId) },
            { employees: mongoose.Types.ObjectId(userId) }
          ]
        }
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