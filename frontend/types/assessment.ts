export type QuestionDifficulty = "easy" | "medium" | "hard"

export type AssignmentJobStatus =
  | "idle"
  | "pending"
  | "queued"
  | "processing"
  | "completed"
  | "failed"

export interface GeneratedQuestion {
  id: number
  text: string
  marks: number
  difficulty: QuestionDifficulty
}

export interface GeneratedSection {
  name: string
  instructions: string
  questions: GeneratedQuestion[]
}

export interface GeneratedPaper {
  title: string
  subject: string
  duration: string
  totalMarks: number
  sections: GeneratedSection[]
  studentInfo: {
    name: string
    rollNumber: string
    section: string
  }
  sourceSummary?: string
}

export interface AssessmentData {
  title: string
  file: File | null
  dueDate: Date | undefined
  questionType: string
  numberOfQuestions: number
  totalMarks: number
  instructions: string
}

export interface BackendAssignment {
  _id: string
  title: string
  subject?: string
  dueDate?: string
  questionType: string
  numberOfQuestions: number
  marks: number
  instructions?: string
  status: AssignmentJobStatus
  queueJobId?: string
  generatedPaper?: GeneratedPaper
  error?: string
}

export interface AssignmentUpdatePayload {
  assignmentId: string
  status: AssignmentJobStatus
  message?: string
  paper?: GeneratedPaper
  assignment?: BackendAssignment
}