const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const { sendLeaveApprovalEmail, sendLeaveRejectionEmail } = require("../utils/mailgunService");

//ADD LEAVE
const addLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, description, employeeId } = req.body;

    if (!leaveType || !fromDate || !toDate || !description || !employeeId) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    const leave = await Leave.create({
      employeeId,
      leaveType,
      description,
      fromDate,
      toDate,
      document: req.file ? req.file.filename : null,
      status: "Pending"
    });

    res.status(201).json({ success: true, data: leave });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  GET ALL 
const getLeaves = async (req, res) => {
  try {
    const { status, employeeId, fromDate, toDate, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (employeeId) filter.employeeId = employeeId;

    if (fromDate && toDate) {
      filter.fromDate = { $gte: new Date(fromDate) };
      filter.toDate = { $lte: new Date(toDate) };
    }

    const skip = (page - 1) * limit;

   const leaves = await Leave.find(filter)
  .populate("employeeId", "name email employeeId role")
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(parseInt(limit));

    const total = await Leave.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: leaves
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  GET BY ID 
const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found"
      });
    }

    res.json({ success: true, data: leave });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE 
const updateLeave = async (req, res) => {
  try {
    const updated = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  DELETE 
const deleteLeave = async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Leave deleted" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// STATUS UPDATE 
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, denialReason } = req.body;

    const updated = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        denialReason: status === "Rejected" ? denialReason : ""
      },
      { new: true }
    );

    const employee = await Employee.findById(updated.employeeId);

    if (employee?.email) {
      if (status === "Approved") {
        await sendLeaveApprovalEmail(employee.email, updated);
      }
      if (status === "Rejected") {
        await sendLeaveRejectionEmail(employee.email, updated);
      }
    }

    res.json({
      success: true,
      message: "Status updated",
      data: updated
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  ANALYTICS 
const getLeaveAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;

    const stats = await Leave.aggregate([
      { $match: { employeeId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    let result = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    };

    stats.forEach(s => {
      result.total += s.count;
      if (s._id === "Approved") result.approved = s.count;
      if (s._id === "Pending") result.pending = s.count;
      if (s._id === "Rejected") result.rejected = s.count;
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// EXPORT 
module.exports = {
  addLeave,
  getLeaves,
  getLeaveById,
  updateLeave,
  updateLeaveStatus,
  deleteLeave,
  getLeaveAnalytics
};