const Assignment = require("../models/Assignment");
const { emitAssignmentUpdate } = require("../config/socket");
const { generateStructuredPaper } = require("./aiService");

async function processAssignment(assignmentId) {
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  assignment.status = "processing";
  assignment.error = undefined;
  await assignment.save();

  emitAssignmentUpdate(assignmentId, {
    status: "processing",
    message: "Generating a structured question paper...",
  });

  const generated = generateStructuredPaper({
    title: assignment.title,
    subject: assignment.subject,
    className: assignment.className,
    duration: assignment.duration,
    dueDate: assignment.dueDate,
    questionType: assignment.questionType,
    numberOfQuestions: assignment.numberOfQuestions,
    marks: assignment.marks,
    instructions: assignment.instructions,
    sourceContext: assignment.sourceContent,
    sourceFileName: assignment.sourceFileName,
  });

  assignment.status = "completed";
  assignment.prompt = generated.prompt;
  assignment.generatedPaper = generated.paper;
  assignment.resultGeneratedAt = new Date();
  await assignment.save();

  const payload = {
    status: "completed",
    message: "Question paper generated successfully.",
    paper: generated.paper,
    assignment: assignment.toObject(),
  };

  emitAssignmentUpdate(assignmentId, payload);

  return payload;
}

async function failAssignment(assignmentId, error) {
  const assignment = await Assignment.findById(assignmentId);

  if (assignment) {
    assignment.status = "failed";
    assignment.error = error.message;
    await assignment.save();
  }

  emitAssignmentUpdate(assignmentId, {
    status: "failed",
    message: error.message,
  });
}

module.exports = {
  processAssignment,
  failAssignment,
};