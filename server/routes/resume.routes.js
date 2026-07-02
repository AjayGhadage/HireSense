const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const {
  upload: uploadHandler,
  listByJob,
  listAll,
  getOne,
  remove,
} = require("../controllers/resume.controller");

// Upload resumes (up to 20 files)
router.post("/upload", authenticate, upload.array("resumes", 20), uploadHandler);

// Get all resumes
router.get("/", authenticate, listAll);

// Get all resumes for a job
router.get("/job/:jobId", authenticate, listByJob);

// Get single resume detail
router.get("/:id", authenticate, getOne);

// Delete a resume
router.delete("/:id", authenticate, remove);

module.exports = router;
