"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"

import { ExamPaper } from "@/components/exam-paper"
import Shell from "@/components/shell"
import type { AssignmentJobStatus, GeneratedPaper } from "@/types/assessment"

const STORAGE_KEY = "vedaai-generated-paper"
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

export default function GeneratedPaperPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paper, setPaper] = useState<GeneratedPaper | null>(null)
  const [status, setStatus] = useState<AssignmentJobStatus>("completed")
  const [message, setMessage] = useState<string>("Loaded generated paper in a new page.")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const assignmentId = searchParams.get("id")

    if (assignmentId) {
      const loadAssignment = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/assignments/${assignmentId}`)
          const assignment = response.data.assignment

          if (!assignment?.generatedPaper) {
            setPaper(null)
            setStatus("failed")
            setMessage("This assignment is not ready yet. Open a completed assignment.")
            return
          }

          setPaper(assignment.generatedPaper as GeneratedPaper)
          setStatus("completed")
          setMessage("Loaded assignment in paper view.")
          localStorage.setItem(STORAGE_KEY, JSON.stringify(assignment.generatedPaper))
        } catch {
          setPaper(null)
          setStatus("failed")
          setMessage("Unable to load this assignment.")
        }
      }

      void loadAssignment()
      return
    }

    const rawPaper = localStorage.getItem(STORAGE_KEY)
    if (!rawPaper) {
      setPaper(null)
      setStatus("failed")
      setMessage("No generated paper was found. Go back and generate one first.")
      return
    }

    try {
      const parsedPaper = JSON.parse(rawPaper) as GeneratedPaper
      setPaper(parsedPaper)
      setStatus("completed")
      setMessage("Loaded generated paper in a new page.")
    } catch {
      setPaper(null)
      setStatus("failed")
      setMessage("Saved paper data could not be read. Generate the paper again.")
    }
  }, [])

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#efefef] text-[#555]">
        Loading generated paper...
      </div>
    )
  }

  return (
    <Shell>
      <div className="relative mx-auto min-h-screen max-w-350 overflow-hidden border border-[#cfd2d8] bg-[#ececec] p-2 md:min-h-[calc(100vh-3rem)] md:rounded-[26px] md:p-3">
        <ExamPaper
          paper={paper}
          status={status}
          message={message}
          onReset={() => {
            localStorage.removeItem(STORAGE_KEY)
            router.push("/")
          }}
        />
      </div>
    </Shell>
  )
}
