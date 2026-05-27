"use client"

import { useState } from "react"
import { pdf } from "@react-pdf/renderer"
import { Download, Loader2, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { QuestionPaperDocument } from "@/components/question-paper-document"
import type { AssignmentJobStatus, GeneratedPaper } from "@/types/assessment"

interface ExamPaperProps {
  paper: GeneratedPaper | null
  status: AssignmentJobStatus
  message?: string
  onReset: () => void
}

const difficultyStyles: Record<string, string> = {
  easy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  hard: "border-rose-500/30 bg-rose-500/10 text-rose-700",
}

const statusStyles: Record<AssignmentJobStatus, string> = {
  idle: "border-border bg-muted text-muted-foreground",
  pending: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  queued: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  processing: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  failed: "border-rose-500/30 bg-rose-500/10 text-rose-700",
}

export function ExamPaper({ paper, status, message, onReset }: ExamPaperProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!paper) {
      return
    }

    setIsDownloading(true)
    try {
      const blob = await pdf(<QuestionPaperDocument paper={paper} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${paper.title.replace(/\s+/g, "-").toLowerCase()}-question-paper.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="border-border bg-card shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
      <CardHeader className="space-y-3 border-b border-border">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl text-foreground">Generated Question Paper</CardTitle>
            <CardDescription>
              {paper ? "Structured output generated from the assignment request." : "Waiting for a generated paper."}
            </CardDescription>
          </div>
          <Badge variant="outline" className={statusStyles[status]}>
            {status}
          </Badge>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" className="border-border" onClick={handleDownload} disabled={!paper || isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
          <Button variant="outline" className="border-border" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {!paper ? (
          <div className="rounded-xl border border-dashed border-border bg-accent/20 p-8 text-center text-sm text-muted-foreground">
            {status === "failed"
              ? "Generation failed. Please submit again with a valid title and marks."
              : "Generate an assessment to preview the structured question paper here."}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-linear-to-br from-slate-950 to-slate-800 p-6 text-white shadow-lg">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Assessment Preview</p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-tight">{paper.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{paper.subject}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm md:min-w-75">
                  <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-300">Duration</p>
                    <p className="mt-1 font-semibold">{paper.duration}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-300">Total Marks</p>
                    <p className="mt-1 font-semibold">{paper.totalMarks}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-accent/20 p-5">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Student Information
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Name</p>
                  <p className="mt-2 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-muted-foreground">
                    {paper.studentInfo.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Roll Number</p>
                  <p className="mt-2 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-muted-foreground">
                    {paper.studentInfo.rollNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Section</p>
                  <p className="mt-2 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-muted-foreground">
                    {paper.studentInfo.section}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              {paper.sections.map((section) => {
                const sectionMarks = section.questions.reduce((sum, question) => sum + question.marks, 0)

                return (
                  <div key={section.name} className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-foreground">{section.name}</h3>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {sectionMarks} marks
                      </Badge>
                    </div>
                    <p className="text-sm italic text-muted-foreground">{section.instructions}</p>

                    <div className="space-y-4">
                      {section.questions.map((question, index) => (
                        <article
                          key={question.id}
                          className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="mb-3 flex flex-wrap items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                                  {index + 1}
                                </span>
                                <Badge variant="outline" className={difficultyStyles[question.difficulty]}>
                                  {question.difficulty}
                                </Badge>
                              </div>
                              <p className="pl-10 leading-relaxed text-foreground">{question.text}</p>
                            </div>
                            <div className="shrink-0 text-right text-sm font-semibold text-primary">
                              [{question.marks} marks]
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
