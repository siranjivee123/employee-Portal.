require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const leaveRoutes = require("./routes/leave.routes");

const app = express();

// DB
connectDB();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api", dashboardRoutes);
// STATIC
app.use("/uploads", express.static("uploads"));
app.set("etag", false);
// TEST ROUTE (optional remove)
app.get("/", (req, res) => {
  res.send("API Running...");
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});