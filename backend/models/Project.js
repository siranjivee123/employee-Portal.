const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    description: { type: String , required: true},

    category: {
      type: String,
      required: true,
      enum: ['IT','Finance','HR'],
    },
 manager: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    }
  ],

  
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    }
  ],
    status: {
  type: String,
  enum: ['Pending', 'In Progress', 'Completed'],
  default: 'Pending'
},
  },
  { timestamps: true }
);


//INDEXES
projectSchema.index({ name: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ employees: 1 });

module.exports = mongoose.model('Project', projectSchema);