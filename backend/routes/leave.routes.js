const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const leaveController = require("../controllers/leaveController");

// CREATE
router.post("/add", upload.single("document"), leaveController.addLeave);

// ANALYTICS
router.get("/dashboard/leaves/:userId", leaveController.getLeaveAnalytics);

// READ
router.get("/all", leaveController.getLeaves);
router.get("/:id", leaveController.getLeaveById);

// UPDATE
router.put("/update/:id", leaveController.updateLeave);

// DELETE
router.delete("/delete/:id", leaveController.deleteLeave);

// STATUS
router.put("/status/:id", leaveController.updateLeaveStatus);

module.exports = router;