const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: String,
  address: String,

  password: {
    type: String,
    default:null
  },
tempPassword: String,

  profileImage: String,
   role: {
    type: String,
    enum: ['employee', 'manager'],
    default: 'employee',
    required: true
  },
  projects: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  }
],

tasks: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  }
],


  

  
  shift: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },

  zip: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});


//INDEXES for filtering/search
employeeSchema.index({ name: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ city: 1 });
employeeSchema.index({ state: 1 });
employeeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Employee", employeeSchema);