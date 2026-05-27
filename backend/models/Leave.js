const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Employee"
},

    leaveType: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    fromDate: {
      type: Date,
      required: true
    },

    toDate: {
      type: Date,
      required: true
    },

    document: {
      type: String
    },

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },

    denialReason: {
      type: String
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    },

    approvedAt: Date
  },
  { timestamps: true }
);

//  Date validation
leaveSchema.pre("save", function () {
  if (this.fromDate > this.toDate) {
    throw new Error("From date cannot be greater than To date");
  }

  if (this.status !== "Rejected") {
    this.denialReason = "";
  }
});

// Indexes
leaveSchema.index({ status: 1 });
leaveSchema.index({ createdAt: -1 });
leaveSchema.index({ employeeId: 1 });
leaveSchema.index({ fromDate: 1, toDate: 1 });

//  Virtual
leaveSchema.virtual("duration").get(function () {
  const diff = this.toDate - this.fromDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
});

module.exports = mongoose.model('Leave', leaveSchema);