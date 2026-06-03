const express = require("express");
const router = express.Router();
const { getTaskAnalytics } = require("../controllers/taskController");

const {
  addTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
   getTasksByEmployee,
   getTasksByEmployeeProjects

  } = require("../controllers/taskController");

// CRUD
router.post("/add", addTask);

router.put("/update/:id", updateTask);
router.delete("/delete/:id", deleteTask);
router.get("/dashboard/tasks/:userId", getTaskAnalytics);
router.get("/employee/:empId", getTasksByEmployee);
router.get("/employee-project-tasks/:empId", getTasksByEmployeeProjects);
router.get("/all", getTasks);
router.get("/:id", getTaskById);
module.exports = router;