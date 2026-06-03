const express = require("express");
const router = express.Router();
const { getProjectAnalytics } = require("../controllers/projectController");

const {
  addProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByEmployee
} = require("../controllers/projectController");

//  CRUD
router.post("/add", addProject);
router.get("/all", getProjects);
router.get("/:id", getProjectById);
router.put("/update/:id", updateProject);
router.delete("/delete/:id", deleteProject);
router.get("/dashboard/projects/:userId", getProjectAnalytics);
router.get("/employee/:id", getProjectsByEmployee);

module.exports = router;