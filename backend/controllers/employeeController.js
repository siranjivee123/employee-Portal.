const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const { sendWelcomeEmail } = require("../services/mailService");

// Generate Employee ID
function generateEmployeeId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let empId = "";

  for (let i = 0; i < 6; i++) {
    empId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return "EMP" + empId;
}

/* ADD EMPLOYEE */
exports.addEmployee = async (req, res) => {
  try {
    console.log(" API HIT RECEIVED");

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
      managers
      
    } = req.body;

    //  PARSE FUNCTION
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

    const parsedProjects = safeParseArray(projects);
    const parsedManagers = safeParseArray(managers);

    // Generate password
const tempPassword = Math.random().toString(36).slice(2, 10);
const hashedPassword = await bcrypt.hash(tempPassword, 10);
    //  Generate UNIQUE Employee ID
    let employeeId;
    let exists = true;

    while (exists) {
      employeeId = generateEmployeeId();
      const user = await Employee.findOne({ employeeId });
      if (!user) exists = false;
    }

    // Create employee
    const employee = new Employee({
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      role: req.body.role || "employee",
      shift: shift || "",
      password: hashedPassword,

      employeeId, // 

      profileImage: req.file
        ? `/uploads/${req.file.filename}`
        : null,

       projects: parsedProjects,
  managers: parsedManagers,
    });

    //  Save
    await employee.save();

    // Send email 
    await sendWelcomeEmail(email, tempPassword, name, employeeId);

    return res.status(201).json({
      message: "Employee created successfully",
      employee
    });

  } catch (err) {
    console.log("ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email or Employee ID already exists"
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
};
// Profile Image 

exports.updateProfileImage = async (req, res) => {
  try {
    const employeeId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const updated = await Employee.findByIdAndUpdate(
      employeeId,
      {
        profileImage: `/uploads/${req.file.filename}`
      },
      { new: true }
    );

    res.json({
      message: "Profile image updated",
      employee: updated
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};
exports.deleteEmployee = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);

    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* GET EMPLOYEES */
exports.getEmployees = async (req, res) => {
  try {
    const {
      role,
      city,
      search,
      page = 1,
      limit = 10
    } = req.query;

    let filter = {};

    // FILTERS
    if (role) filter.role = role;
    if (city) filter.city = city;

    // SEARCH (name/email)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const employees = await Employee.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(filter);

    return res.status(200).json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      employees
    });

  } catch (err) {
    console.log("GET EMPLOYEES ERROR:", err);

    return res.status(500).json({
      message: err.message
    });
  }
};