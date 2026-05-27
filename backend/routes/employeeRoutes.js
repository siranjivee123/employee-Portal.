const express = require("express");
const router = express.Router();

// Middleware
const upload = require("../config/multer");

// Controllers
const {
  addEmployee,
  getEmployees,
     deleteEmployee,
   updateProfileImage,
} = require("../controllers/employeeController");

// ADD 

router.post(
  "/add",
  upload.single("profileImage"),
  addEmployee
);


// GET ALL EMPLOYEES
router.get(
  "/all",
  getEmployees
);
//DELETE

router.delete("/delete/:id", deleteEmployee);

// PROFILE IMAGE
router.put(
  "/:id/profile-image",
  upload.single("profileImage"),
  updateProfileImage
);

module.exports = router;