const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Employee = require('./models/Employee');

mongoose.connect('mongodb://127.0.0.1:27017/yourdb');

async function createAdmin() {

  const hashed = await bcrypt.hash("admin123", 10);

  await Employee.create({
    employeeId: "ADMIN001",
    name: "Admin",
    email: "admin@gmail.com",
    phone: "9976123465",
    password: hashed,
    role: "admin",
    shift: "AM",
    city: "Madurai",
    state: "Tamil Nadu",
    zip: "625001"
  });

  console.log("Admin Created");
  process.exit();
}

createAdmin();