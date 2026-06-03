const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const { sendWelcomeEmail } = require("../services/mailService");

//  GENERATE EMPLOYEE ID 
function generateEmployeeId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let empId = "";

  for (let i = 0; i < 6; i++) {
    empId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return "EMP" + empId;
}

//  PARSE 
const safeParseArray = (data) => {
  if (!data) return [];

  try {
    if (Array.isArray(data)) return data;
    if (typeof data === "string") return JSON.parse(data);
    return [];
  } catch {
    return [];
  }
};

//  ADD EMPLOYEE 
exports.addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      role,
      shift,
      projects,
      managers,
      tasks
    } = req.body;

    const parsedProjects = safeParseArray(projects)
     .filter(Boolean)
  .map(id => new mongoose.Types.ObjectId(id));
    const parsedManagers = safeParseArray(managers);
    const parsedTasks = safeParseArray(tasks);

    const tempPassword = Math.random().toString(36).slice(2, 10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // unique employeeId
    let employeeId;
    let exists = true;

    while (exists) {
      employeeId = generateEmployeeId();
      const user = await Employee.findOne({ employeeId });
      if (!user) exists = false;
    }

    const employee = new Employee({
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      role: role || "employee",
      shift: shift || "",
      password: hashedPassword,
      employeeId,
      profileImage: req.file ? `/uploads/${req.file.filename}` : null,
      projects: parsedProjects,
      tasks: parsedTasks,
    });

    await employee.save();

    await sendWelcomeEmail(email, tempPassword, name, employeeId);

    res.status(201).json({
      message: "Employee created successfully",
      employee
    });

  } catch (err) {
    console.error("ADD EMPLOYEE ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email or Employee ID already exists"
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
};

//  GET EMPLOYEES 
exports.getEmployees = async (req, res) => {
  try {
    const { role, city, search, page = 1, limit = 10 } = req.query;

    let matchStage = {};

    if (role) matchStage.role = role;
    if (city) matchStage.city = city;

    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const employees = await Employee.aggregate([
      { $match: matchStage },

      // PROJECTS LOOKUP
      {
        $lookup: {
          from: "projects",
          localField: "projects",
          foreignField: "_id",
          as: "projects"
        }
      },

      // TASKS LOOKUP
     {
  $lookup: {
    from: "tasks",
    localField: "_id",
    foreignField: "assignedTo",
    as: "tasks"
  }
},

      // OUTPUT 
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          city: 1,
          role: 1,
          employeeId: 1,
          profileImage: 1,
          createdAt: 1,
          updatedAt: 1,

          //   projects 
          projects: {
            $map: {
              input: "$projects",
              as: "p",
              in: {
                _id: "$$p._id",
                name: "$$p.name"
              }
            }
          },

         tasks: {
  $map: {
    input: { $ifNull: ["$tasks", []] },
    as: "t",
    in: {
      _id: "$$t._id",
      ticket: "$$t.ticket",
      status: "$$t.status"
    }
  }
}
        }
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const total = await Employee.countDocuments(matchStage);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      employees
    });

  } catch (err) {
    console.error("GET EMPLOYEES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET EMPLOYEE BY ID 
exports.getEmployeeById = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);

    const employee = await Employee.aggregate([
      { $match: { _id: id } },
// LOOKUP PROJECTS
      {
        $lookup: {
          from: "projects",
          localField: "projects",
          foreignField: "_id",
          as: "projects"
        }
      },
// LOOKUP TASKS
      {
        $lookup: {
          from: "tasks",
          localField: "tasks",
          foreignField: "_id",
          as: "tasks"
        }
      },
// PROJECT OUTPUT
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          city: 1,
          role: 1,
          employeeId: 1,
          profileImage: 1,
          createdAt: 1,
          updatedAt: 1,
//   projects OUTPUT
          projects: {
            $map: {
              input: "$projects",
              as: "p",
              in: {
                _id: "$$p._id",
                name: "$$p.name"
              }
            }
          },
// TASKS OUTPUT
          tasks: {
            $map: {
              input: "$tasks",
              as: "t",
              in: {
                _id: "$$t._id",
                ticket: "$$t.ticket",
                status: "$$t.status"
              }
            }
          }
        }
      }
    ]);

    res.json(employee[0] || null);

  } catch (err) {
    console.error("GET ONE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

//  UPDATE PROFILE IMAGE 
exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { profileImage: `/uploads/${req.file.filename}` },
      { new: true }
    );

    res.json({
      message: "Profile image updated",
      employee: updated
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {

    const role = (req.query.role || '').toLowerCase();

    // Only admin allowed
    if (role !== 'admin') {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      message: "Employee updated successfully",
      employee: updated
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

//  DELETE EMPLOYEE 
exports.deleteEmployee = async (req, res) => {
  try {

    const role = (req.query.role || '').toLowerCase();

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete' });
    }
    const emp = await Employee.findByIdAndDelete(req.params.id);

    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};
