const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const {
  listByJob,
  listAll,
  getOne,
  updateStatus,
  updateNotes,
} = require("../controllers/candidate.controller");

router.get("/", authenticate, listAll);
router.get("/job/:jobId", authenticate, listByJob);
router.get("/:id", authenticate, getOne);
router.patch("/:id/status", authenticate, updateStatus);
router.patch("/:id/notes", authenticate, updateNotes);

module.exports = router;
