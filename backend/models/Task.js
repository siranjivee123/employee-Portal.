const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  ticket: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
 project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
assignedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Employee"
},
  
assignedTo: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Employee"
},
  
  shift: {
    type: String,
    required: true
  },
  status: {
  type: String,
  enum: ['Pending', 'In Progress', 'Completed'],
  default: 'Pending'
},
 
  effort: {
    type: Number,
    required: true
  }
}, {
  timestamps: true   
});

//Indexes
taskSchema.index({ project: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ shift: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ ticket: 1 });

module.exports = mongoose.model('Task', taskSchema);