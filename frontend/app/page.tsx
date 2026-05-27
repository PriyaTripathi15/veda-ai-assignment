"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  FolderOpen,
  Loader2,
  Search,
  SearchX,
  Sparkles,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react"

import { AssessmentForm } from "@/components/assessment-form"
import { ExamPaper } from "@/components/exam-paper"
import { Card, CardContent } from "@/components/ui/card"
import Shell from "@/components/shell"

import { connectSocket } from "@/lib/socket"
import { useAssessmentStore } from "@/store/use-assessment-store"

import type {
  AssessmentData,
  BackendAssignment,
  AssignmentUpdatePayload,
} from "@/types/assessment"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000"

export default function Home() {
  const router = useRouter()

  const hasOpenedPaperRef = useRef(false)

  const {
    currentAssignment,
    generatedPaper,
    jobStatus,
    jobMessage,
    error,
    showBuilder,
    setShowBuilder,
    setSocketConnected,
    setJobState,
    setCurrentAssignment,
    setGeneratedPaper,
    applyServerUpdate,
    setError,
    resetAssessment,
  } = useAssessmentStore()

  const [isDesktop, setIsDesktop] =
    useState(false)

  const [search, setSearch] = useState("")

  // ASSIGNMENTS
  const [assignments, setAssignments] =
    useState<any[]>([])

  const [pageNum, setPageNum] = useState(1)

  const [totalPages, setTotalPages] =
    useState(1)

  const [limit] = useState(8)

  const [loadingList, setLoadingList] =
    useState(false)

  // SOCKET
  useEffect(() => {
    const socket = connectSocket()

    const handleConnect = () =>
      setSocketConnected(true)

    const handleDisconnect = () =>
      setSocketConnected(false)

    const handleAssignmentUpdate = (
      update: AssignmentUpdatePayload
    ) => {
      const activeAssignmentId =
        useAssessmentStore.getState()
          .currentAssignment?._id

      if (
        !activeAssignmentId ||
        update.assignmentId !== activeAssignmentId
      ) {
        return
      }

      applyServerUpdate(update)
    }

    socket.on("connect", handleConnect)

    socket.on(
      "disconnect",
      handleDisconnect
    )

    socket.on(
      "assignment:updated",
      handleAssignmentUpdate
    )

    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.off("connect", handleConnect)

      socket.off(
        "disconnect",
        handleDisconnect
      )

      socket.off(
        "assignment:updated",
        handleAssignmentUpdate
      )
    }
  }, [applyServerUpdate, setSocketConnected])

  // RESPONSIVE
  useEffect(() => {
    const check = () =>
      setIsDesktop(
        window.innerWidth >= 1024
      )

    check()

    window.addEventListener(
      "resize",
      check
    )

    return () =>
      window.removeEventListener(
        "resize",
        check
      )
  }, [])

  // FETCH ASSIGNMENTS
  const fetchAssignments = async (
    page = 1
  ) => {
    try {
      setLoadingList(true)

      const res = await axios.get(
        `${API_BASE_URL}/api/assignments?page=${page}&limit=${limit}`
      )

      setAssignments(
        res.data.assignments || []
      )

      setPageNum(
        res.data.page || page
      )

      setTotalPages(
        res.data.totalPages || 1
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    if (isDesktop) {
      fetchAssignments(pageNum)
    }
  }, [isDesktop, pageNum])

  // SUBMIT
  const handleSubmitAssessment =
    async (data: AssessmentData) => {
      setError(null)

      setJobState(
        "pending",
        "Generating AI paper..."
      )

      try {
        const formData = new FormData()

        formData.append(
          "title",
          data.title
        )

        if (data.subject)
          formData.append(
            "subject",
            data.subject
          )

        if (data.duration)
          formData.append(
            "duration",
            data.duration
          )

        if (data.className)
          formData.append(
            "className",
            data.className
          )

        formData.append(
          "questionType",
          data.questionType
        )

        formData.append(
          "numberOfQuestions",
          String(data.numberOfQuestions)
        )

        formData.append(
          "marks",
          String(data.totalMarks)
        )

        formData.append(
          "instructions",
          data.instructions
        )

        if (data.dueDate) {
          formData.append(
            "dueDate",
            data.dueDate.toISOString()
          )
        }

        if (data.file) {
          formData.append(
            "file",
            data.file
          )
        }

        const response =
          await axios.post(
            `${API_BASE_URL}/api/assignments/create`,
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          )

        const assignment =
          response.data
            .assignment as BackendAssignment

        setCurrentAssignment(
          assignment
        )

        fetchAssignments(1)

        if (
          response.data.generatedPaper
        ) {
          setGeneratedPaper(
            response.data.generatedPaper
          )

          setJobState(
            "completed",
            "Question paper generated successfully."
          )
        } else {
          setGeneratedPaper(null)

          setJobState(
            assignment.status ||
              "queued",
            "Assignment queued."
          )
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            "Failed to create assignment"
        )

        setJobState(
          "failed",
          "Failed to create assignment"
        )
      }
    }

  // OPEN ASSIGNMENT
  const openAssignment = async (
    assignmentId: string
  ) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/assignments/${assignmentId}`
      )

      const assignment =
        res.data.assignment

      if (
        !assignment?.generatedPaper
      ) {
        return
      }

      localStorage.setItem(
        "vedaai-generated-paper",
        JSON.stringify(
          assignment.generatedPaper
        )
      )

      router.push(
        `/generated-paper?id=${assignmentId}`
      )
    } catch (err) {
      console.error(err)
    }
  }

  // AUTO REDIRECT
  useEffect(() => {
    if (!generatedPaper) {
      hasOpenedPaperRef.current =
        false

      return
    }

    localStorage.setItem(
      "vedaai-generated-paper",
      JSON.stringify(generatedPaper)
    )

    if (
      hasOpenedPaperRef.current
    ) {
      return
    }

    hasOpenedPaperRef.current =
      true

    router.push("/generated-paper")
  }, [generatedPaper, router])

  const isGenerating =
    jobStatus === "pending" ||
    jobStatus === "queued" ||
    jobStatus === "processing"

  const filteredAssignments =
    assignments.filter((a) =>
      a.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )

  let mainContent

  // ==========================
  // DESKTOP BOARD
  // ==========================

  if (isDesktop && !showBuilder) {
    mainContent = (
      <div className="space-y-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[36px] bg-linear-to-br from-black via-[#111] to-[#1f1f1f] p-10 text-white">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                AI Powered Question Paper
                Generator
              </div>

              <h1 className="text-5xl font-bold leading-tight">
                Create modern
                assignments in
                seconds
              </h1>

              <p className="mt-5 max-w-xl text-[17px] leading-8 text-white/65">
                Generate beautiful
                CBSE-style question
                papers with AI,
                smart formatting,
                PDF export and
                automatic sectioning.
              </p>

              <button
                onClick={() =>
                  setShowBuilder(true)
                }
                className="mt-8 flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                Create Assignment
              </button>
            </div>

            {/* STATS */}
            <div className="grid w-full max-w-md grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <BookOpen className="h-8 w-8 text-white/70" />

                <h2 className="mt-5 text-3xl font-bold">
                  {assignments.length}
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Assignments
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <Users className="h-8 w-8 text-white/70" />

                <h2 className="mt-5 text-3xl font-bold">
                  248
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Students
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <FolderOpen className="h-8 w-8 text-white/70" />

                <h2 className="mt-5 text-3xl font-bold">
                  98%
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Accuracy
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <Sparkles className="h-8 w-8 text-white/70" />

                <h2 className="mt-5 text-3xl font-bold">
                  AI
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Powered
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f8f95]" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search assignments..."
              className="h-15 w-full rounded-full border border-[#e5e5e7] bg-white pl-14 pr-5 text-[15px] shadow-[0_14px_30px_-22px_rgba(0,0,0,0.4)] outline-none transition focus:border-black"
            />
          </div>

          <button
            onClick={() =>
              setShowBuilder(true)
            }
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-black px-7 text-sm font-medium text-white transition hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            New Assignment
          </button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {loadingList ? (
            Array.from({
              length: 6,
            }).map((_, i) => (
              <div
                key={i}
                className="h-60 animate-pulse rounded-[28px] bg-white"
              />
            ))
          ) : filteredAssignments.length ? (
            filteredAssignments.map(
              (a) => (
                <button
                  key={a._id}
                  onClick={() =>
                    openAssignment(
                      a._id
                    )
                  }
                  className="group overflow-hidden rounded-[30px] border border-[#ececec] bg-white p-7 text-left shadow-[0_25px_45px_-35px_rgba(0,0,0,0.6)] transition duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex rounded-full bg-black px-4 py-1 text-xs font-medium text-white">
                        AI Generated
                      </div>

                      <h2 className="mt-5 text-2xl font-bold text-[#1f1f22]">
                        {a.title}
                      </h2>

                      <p className="mt-3 text-sm leading-7 text-[#777]">
                        Subject:
                        {" "}
                        {a.subject ||
                          "General"}
                      </p>
                    </div>

                    <div className="rounded-full bg-[#f5f5f7] p-3 transition group-hover:bg-black group-hover:text-white">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-[#f1f1f1] pt-5">
                    <div>
                      <p className="text-xs text-[#999]">
                        Created
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#222]">
                        {new Date(
                          a.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#999]">
                        Due
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#222]">
                        {a.dueDate ||
                          "-"}
                      </p>
                    </div>
                  </div>
                </button>
              )
            )
          ) : (
            <div className="col-span-2 rounded-[30px] border border-dashed border-[#d9d9dd] bg-white p-16 text-center">
              <SearchX className="mx-auto h-14 w-14 text-[#bbb]" />

              <h2 className="mt-6 text-2xl font-semibold">
                No assignments found
              </h2>

              <p className="mt-2 text-[#888]">
                Create your first AI
                assignment paper.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ==========================
  // BUILDER
  // ==========================

  else {
    mainContent = (
      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <AssessmentForm
            onSubmit={
              handleSubmitAssessment
            }
            isGenerating={
              isGenerating
            }
          />
        </div>

        <div className="space-y-4">
          {(jobStatus ===
            "pending" ||
            jobStatus ===
              "queued" ||
            jobStatus ===
              "processing") &&
          !generatedPaper ? (
            <Card className="rounded-[26px] border-none bg-white shadow-[0_25px_45px_-35px_rgba(0,0,0,0.5)]">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>

                <div>
                  <p className="font-semibold text-[#222]">
                    AI is generating
                    your paper
                  </p>

                  <p className="mt-1 text-sm text-[#777]">
                    {jobMessage}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {error ? (
            <Card className="rounded-[26px] border-red-200 bg-red-50">
              <CardContent className="p-5 text-sm text-red-500">
                {error}
              </CardContent>
            </Card>
          ) : null}

          <ExamPaper
            paper={generatedPaper}
            status={jobStatus}
            message={
              jobMessage ||
              undefined
            }
            onReset={() => {
              resetAssessment()
              setShowBuilder(false)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <Shell>
      <div className="mx-auto max-w-350 p-4 md:p-7">
        {mainContent}
      </div>
    </Shell>
  )
}