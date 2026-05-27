const express = require("express");
const router = express.Router();
const { getTaskAnalytics } = require("../controllers/taskController");

const {
  addTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

// CRUD
router.post("/add", addTask);
router.get("/all", getTasks);
router.get("/:id", getTaskById);
router.put("/update/:id", updateTask);
router.delete("/delete/:id", deleteTask);
router.get("/dashboard/tasks/:userId", getTaskAnalytics);


module.exports = router;