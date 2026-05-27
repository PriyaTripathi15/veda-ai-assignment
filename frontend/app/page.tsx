"use client"

import { useEffect } from "react"
import axios from "axios"
import { Loader2, Radar, Wifi, WifiOff } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { AssessmentForm } from "@/components/assessment-form"
import { ExamPaper } from "@/components/exam-paper"
import { Card, CardContent } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { connectSocket } from "@/lib/socket"
import { useAssessmentStore } from "@/store/use-assessment-store"
import type { AssessmentData, BackendAssignment, AssignmentUpdatePayload } from "@/types/assessment"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

export default function Home() {
  const {
    currentAssignment,
    generatedPaper,
    jobStatus,
    jobMessage,
    socketConnected,
    error,
    setSocketConnected,
    setJobState,
    setCurrentAssignment,
    setGeneratedPaper,
    applyServerUpdate,
    setError,
    resetAssessment,
  } = useAssessmentStore()

  useEffect(() => {
    const socket = connectSocket()

    const handleConnect = () => setSocketConnected(true)
    const handleDisconnect = () => setSocketConnected(false)
    const handleAssignmentUpdate = (update: AssignmentUpdatePayload) => {
      const activeAssignmentId = useAssessmentStore.getState().currentAssignment?._id

      if (!activeAssignmentId || update.assignmentId !== activeAssignmentId) {
        return
      }

      applyServerUpdate(update)
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("assignment:updated", handleAssignmentUpdate)

    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("assignment:updated", handleAssignmentUpdate)
    }
  }, [applyServerUpdate, setSocketConnected])

  useEffect(() => {
    const assignmentId = currentAssignment?._id
    if (!assignmentId) {
      return
    }

    const socket = connectSocket()
    socket.emit("assignment:join", { assignmentId })

    return () => {
      socket.emit("assignment:leave", { assignmentId })
    }
  }, [currentAssignment?._id])

  const handleSubmitAssessment = async (data: AssessmentData) => {
    setError(null)
    setJobState("pending", "Submitting assignment...")

    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("questionType", data.questionType)
      formData.append("numberOfQuestions", String(data.numberOfQuestions))
      formData.append("marks", String(data.totalMarks))
      formData.append("instructions", data.instructions)

      if (data.dueDate) {
        formData.append("dueDate", data.dueDate.toISOString())
      }

      if (data.file) {
        formData.append("file", data.file)
      }

      const response = await axios.post(`${API_BASE_URL}/api/assignments/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const assignment = response.data.assignment as BackendAssignment
      setCurrentAssignment(assignment)

      if (response.data.generatedPaper) {
        setGeneratedPaper(response.data.generatedPaper)
        setJobState("completed", response.data.message || "Question paper generated successfully.")
      } else {
        setGeneratedPaper(null)
        setJobState(assignment.status || "queued", response.data.message || "Assignment queued.")
      }

      const socket = connectSocket()
      socket.emit("assignment:join", { assignmentId: assignment._id })
    } catch (submissionError) {
      const message = axios.isAxiosError(submissionError)
        ? submissionError.response?.data?.error || submissionError.message
        : "Unable to submit assignment"

      setError(message)
      setJobState("failed", message)
    }
  }

  const isGenerating = jobStatus === "pending" || jobStatus === "queued" || jobStatus === "processing"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-4 md:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-border bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.8)]">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-xl space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200">
                      <Radar className="h-3.5 w-3.5" />
                      VedaAI Assessment Creator
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        Build structured assessments and question papers in one workflow.
                      </h1>
                      <p className="text-sm leading-6 text-slate-300 md:text-base">
                        Use the form to queue a paper, watch status updates in real time, and export the finished output as a PDF.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm md:min-w-70">
                    <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                      <div className="flex items-center gap-2 text-slate-300">
                        {socketConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                        Live socket
                      </div>
                      <p className="mt-2 text-base font-semibold">{socketConnected ? "Connected" : "Connecting"}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                      <p className="text-slate-300">Status</p>
                      <p className="mt-2 text-base font-semibold capitalize">{jobStatus}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <AssessmentForm onSubmit={handleSubmitAssessment} isGenerating={isGenerating} />
          </div>

          <div className="space-y-6">
            {(jobStatus === "pending" || jobStatus === "queued" || jobStatus === "processing") && !generatedPaper ? (
              <Card className="border-border bg-card shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Processing assessment</p>
                    <p className="text-sm text-muted-foreground">{jobMessage || "Waiting for the generator to finish."}</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {error ? (
              <Card className="border-destructive/30 bg-destructive/10">
                <CardContent className="p-6 text-sm text-destructive">
                  {error}
                </CardContent>
              </Card>
            ) : null}

            <ExamPaper
              paper={generatedPaper}
              status={jobStatus}
              message={jobMessage || undefined}
              onReset={resetAssessment}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}