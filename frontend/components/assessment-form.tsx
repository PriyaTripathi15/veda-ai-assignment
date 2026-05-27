"use client"

import { useCallback, useState } from "react"
import { format } from "date-fns"
import { useDropzone } from "react-dropzone"
import {
  Calendar as CalendarIcon,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { AssessmentData } from "@/types/assessment"

interface AssessmentFormProps {
  onSubmit: (data: AssessmentData) => Promise<void> | void
  isGenerating: boolean
}

export function AssessmentForm({ onSubmit, isGenerating }: AssessmentFormProps) {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [dueDate, setDueDate] = useState<Date>()
  const [questionType, setQuestionType] = useState("")
  const [numberOfQuestions, setNumberOfQuestions] = useState(10)
  const [totalMarks, setTotalMarks] = useState(100)
  const [instructions, setInstructions] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  })

  const removeFile = () => {
    setFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim()) {
      setFormError("Please enter an assessment title.")
      return
    }

    if (!questionType.trim()) {
      setFormError("Please choose a question type.")
      return
    }

    if (!Number.isFinite(numberOfQuestions) || numberOfQuestions < 1) {
      setFormError("Number of questions must be at least 1.")
      return
    }

    if (!Number.isFinite(totalMarks) || totalMarks < 1) {
      setFormError("Total marks must be at least 1.")
      return
    }

    await onSubmit({
      title,
      file,
      dueDate,
      questionType,
      numberOfQuestions,
      totalMarks,
      instructions,
    })
  }

  return (
    <Card className="border-border bg-card shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Create New Assessment
        </CardTitle>
        <CardDescription>
          Upload reference material, pick a structure, and generate a structured paper.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="title">Assessment Title</Label>
            <Input
              id="title"
              required
              placeholder="e.g., Chapter 5: Cell Biology Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Content (PDF/Text)</Label>
            {!file ? (
              <div
                {...getRootProps()}
                className={cn(
                  "rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <p className="mb-1 text-sm text-muted-foreground">
                  {isDragActive
                    ? "Drop the file here..."
                    : "Drag & drop a file here, or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">Supports PDF and TXT files</p>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border bg-accent/50 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start bg-input text-left font-normal border-border",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="short">Short Answer</SelectItem>
                  <SelectItem value="long">Long Answer</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="questions">Number of Questions</Label>
              <Input
                id="questions"
                type="number"
                min={1}
                max={100}
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks">Total Marks</Label>
              <Input
                id="marks"
                type="number"
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Additional Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="e.g., Focus on practical applications, include diagram-based questions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-25 bg-input border-border"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Assessment...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Assessment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
