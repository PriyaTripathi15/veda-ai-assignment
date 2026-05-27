const express = require("express");
const multer = require("multer");
const Assignment = require("../models/Assignment");
const { getAssignmentQueue } = require("../queue/assignmentQueue");
const { processAssignment } = require("../services/assignmentProcessor");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function parsePositiveNumber(value, fieldName) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    throw new Error(`${fieldName} must be a positive number`);
  }

  return parsedValue;
}

function normalisePayload(body) {
  const title = String(body.title || "").trim();
  const questionType = String(body.questionType || "").trim();
  const instructions = String(body.instructions || "").trim();
  const dueDate = String(body.dueDate || "").trim();

  if (!title) {
    throw new Error("Assessment title is required");
  }

  if (!questionType) {
    throw new Error("Question type is required");
  }

  if (dueDate && Number.isNaN(Date.parse(dueDate))) {
    throw new Error("Due date must be a valid date");
  }

  return {
    title,
    subject: String(body.subject || title).trim(),
    className: String(body.className || body.class || "").trim() || undefined,
    duration: String(body.duration || "").trim() || undefined,
    dueDate: dueDate || undefined,
    questionType,
    numberOfQuestions: parsePositiveNumber(body.numberOfQuestions, "Number of questions"),
    marks: parsePositiveNumber(body.marks, "Total marks"),
    instructions,
  };
}

function extractFileContext(file) {
  if (!file) {
    return {
      sourceContent: "",
      sourceFileName: "",
      sourceFileType: "",
    };
  }

  const isTextFile =
    file.mimetype === "text/plain" || file.originalname.toLowerCase().endsWith(".txt");

  return {
    sourceContent: isTextFile ? file.buffer.toString("utf8").slice(0, 4000) : `Uploaded file: ${file.originalname}`,
    sourceFileName: file.originalname,
    sourceFileType: file.mimetype,
  };
}

router.post("/create", upload.single("file"), async (req, res) => {
  try {
    const payload = normalisePayload(req.body);
    const fileContext = extractFileContext(req.file);

    const assignment = await Assignment.create({
      ...payload,
      ...fileContext,
      status: "pending",
    });

    const queue = getAssignmentQueue();

    if (queue) {
      const job = await queue.add("generate-assignment", {
        assignmentId: assignment._id.toString(),
      });

      assignment.status = "queued";
      assignment.queueJobId = job.id ? String(job.id) : undefined;
      await assignment.save();

      return res.status(202).json({
        message: "Assignment queued for generation",
        assignment,
        queueMode: true,
        jobId: job.id,
      });
    }

    const result = await processAssignment(assignment._id.toString());

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment: result.assignment,
      generatedPaper: result.paper,
      queueMode: false,
    });
  } catch (error) {
    console.error("FULL ERROR:", error);

    if (error.message && /required|positive number|valid date/i.test(error.message)) {
      return res.status(400).json({
        message: "Invalid assignment data",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Error creating assignment",
      error: error.message,
    });
  }
});

// Paginated list endpoint - placed before the "/:id" route to avoid route collision
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const [total, assignments] = await Promise.all([
      Assignment.countDocuments(),
      Assignment.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    const totalPages = Math.ceil(total / limit)

    return res.json({ page, limit, total, totalPages, assignments })
  } catch (error) {
    console.error("Unable to list assignments", error)
    return res.status(500).json({ message: "Unable to list assignments", error: error.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res.json({ assignment });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load assignment", error: error.message });
  }
});

module.exports = router;