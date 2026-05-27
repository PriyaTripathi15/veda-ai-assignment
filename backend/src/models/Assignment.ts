import mongoose, { Schema } from "mongoose"

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: String },
    className: { type: String },
    duration: { type: String },
    dueDate: { type: String },
    questionType: { type: String },
    numberOfQuestions: { type: Number },
    marks: { type: Number },
    instructions: { type: String },
    sourceContent: { type: String },
    sourceFileName: { type: String },
    sourceFileType: { type: String },
    queueJobId: { type: String },
    status: {
      type: String,
      enum: ["pending", "queued", "processing", "completed", "failed"],
      default: "pending",
    },
    prompt: { type: String },
    generatedPaper: { type: Schema.Types.Mixed },
    error: { type: String },
    resultGeneratedAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.model("Assignment", assignmentSchema)