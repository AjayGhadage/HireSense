const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");

const {
  create,
  getAll,
  getOne,
  update,
  remove,
  updateStatus,
} = require("../controllers/job.controller");

// CRUD
router.post("/", authenticate, create);
router.get("/", authenticate, getAll);
router.get("/:id", authenticate, getOne);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);

// Status toggle
router.patch("/:id/status", authenticate, updateStatus);

module.exports = router;
