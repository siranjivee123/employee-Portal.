const express = require('express');
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use('/api/employees', require('.routes/employeeRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
module.exports = app;