"use client"

import { useState } from "react"
import { pdf } from "@react-pdf/renderer"
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  Download,
  FileText,
  Loader2,
  RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { QuestionPaperDocument } from "@/components/question-paper-document"

import type {
  AssignmentJobStatus,
  GeneratedPaper,
} from "@/types/assessment"

interface ExamPaperProps {
  paper: GeneratedPaper | null
  status: AssignmentJobStatus
  message?: string
  onReset: () => void
}

export function ExamPaper({
  paper,
  message,
  onReset,
}: ExamPaperProps) {
  const [isDownloading, setIsDownloading] =
    useState(false)

  const handleDownload = async () => {
    if (!paper) return

    setIsDownloading(true)

    try {
      const blob = await pdf(
        <QuestionPaperDocument paper={paper} />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${paper.title
        .replace(/\s+/g, "-")
        .toLowerCase()}-question-paper.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }

  if (!paper) {
    return (
      <div className="rounded-[32px] bg-white p-10 text-center">
        <p className="text-lg text-[#666]">
          No generated paper found
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#efefef]">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#ececec] bg-white px-8 py-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5]"
          >
            <ChevronLeft className="h-5 w-5 text-[#333]" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[#c1c1c1]">
              ✦
            </span>

            <h2 className="text-[24px] font-semibold text-[#b5b5b5]">
              Create New
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            className="relative"
          >
            <Bell className="h-5 w-5 text-[#222]" />

            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ff6a00]" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#ececec]" />

            <span className="font-medium text-[#232323]">
              John Doe
            </span>

            <ChevronDown className="h-4 w-4 text-[#555]" />
          </div>
        </div>
      </div>

      {/* TOP BLACK CARD */}
      <div className="px-6 pt-6">
        <div className="rounded-[36px] bg-[#232323] px-8 py-8 text-white">
          <div className="space-y-4">
            <h2 className="max-w-[1100px] text-[20px] font-semibold leading-[38px] text-white">
              Your AI generated CBSE question
              paper is ready.
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              <span className="rounded-full bg-white/10 px-4 py-1.5">
                Subject: {paper.subject}
              </span>

              <span className="rounded-full bg-white/10 px-4 py-1.5">
                Class: {paper.className}
              </span>

              <span className="rounded-full bg-white/10 px-4 py-1.5">
                Duration: {paper.duration}
              </span>

              <span className="rounded-full bg-white/10 px-4 py-1.5">
                Total Marks: {paper.totalMarks}
              </span>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="mt-7 h-[56px] rounded-full border border-[#111111] bg-[#111111] px-8 text-[18px] font-medium text-white hover:bg-black"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-3 h-5 w-5" />
                Download as PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* A4 CENTERED PAPER */}
      <div className="flex justify-center px-6 py-10">
        <div
          id="question-paper"
          className="relative w-full max-w-[210mm] bg-white shadow-2xl"
        >
          {/* WATERMARK */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <h1 className="rotate-[-30deg] text-[90px] font-bold text-black/5">
              VedaAI
            </h1>
          </div>

          {/* PAPER CONTENT */}
          <div className="relative z-10 px-[45px] py-[55px]">
            {/* LOGO */}
            <div className="mb-8 flex items-center justify-center gap-4">
              <img
                src="/logo.png"
                alt="school-logo"
                className="h-18 w-18 object-contain"
              />

              <div className="text-center">
                <h1 className="text-[34px] font-bold uppercase tracking-wide text-[#222]">
                  Delhi Public School
                </h1>

                <p className="text-[18px] text-[#555]">
                  Sector-4, Bokaro
                </p>
              </div>
            </div>

            {/* TITLE */}
            <div className="text-center">
              <h2 className="text-[30px] font-bold uppercase text-[#222]">
                {paper.subject}
              </h2>

              <p className="mt-2 text-[18px] font-medium text-[#555]">
                Class: {paper.className}
              </p>
            </div>

            {/* DETAILS */}
            <div className="mt-10 flex items-center justify-between border-y border-[#dcdcdc] py-4 text-[16px] font-semibold">
              <p>
                Time Allowed: {paper.duration}
              </p>

              <p>
                Maximum Marks: {paper.totalMarks}
              </p>
            </div>

            {/* INSTRUCTIONS */}
            <div className="mt-8 space-y-2 text-[15px] leading-7 text-[#333]">
              <p>
                1. All questions are compulsory.
              </p>

              <p>
                2. Read all questions carefully.
              </p>

              <p>
                3. Maintain neat handwriting.
              </p>

              <p>
                4. Marks are indicated against
                each question.
              </p>
            </div>

            {/* STUDENT INFO */}
            <div className="mt-10 grid grid-cols-2 gap-10 text-[16px] font-medium">
              <div>
                Name:
                _______________________
              </div>

              <div>
                Roll Number:
                __________________
              </div>

              <div>
                Section:
                ____________________
              </div>

              <div>
                Date:
                ______________________
              </div>
            </div>

            {/* QUESTIONS */}
            <div className="mt-16 space-y-16">
              {paper.sections.map(
                (section, sectionIndex) => (
                  <div
                    key={section.name}
                    className="break-inside-avoid"
                  >
                    {/* SECTION */}
                    <div className="mb-10 text-center">
                      <h2 className="text-[28px] font-bold uppercase text-[#222]">
                        Section{" "}
                        {String.fromCharCode(
                          65 + sectionIndex
                        )}
                      </h2>

                      <p className="mt-2 text-[16px] italic text-[#666]">
                        {
                          section.instructions
                        }
                      </p>
                    </div>

                    {/* QUESTIONS */}
                    <div className="space-y-10">
                      {section.questions.map(
                        (
                          question,
                          questionIndex
                        ) => (
                          <div
                            key={question.id}
                            className="break-inside-avoid border-b border-dashed border-[#dcdcdc] pb-8"
                          >
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex gap-4">
                                  {/* QUESTION NUMBER */}
                                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#222] text-sm font-semibold text-white">
                                    {questionIndex +
                                      1}
                                  </div>

                                  {/* QUESTION */}
                                  <div>
                                    <p className="text-[18px] leading-[34px] text-[#222]">
                                      {
                                        question.text
                                      }
                                    </p>

                                    {/* ANSWER SPACE */}
                                    <div className="mt-6 space-y-3">
                                      <div className="h-[1px] w-full bg-[#e5e5e5]" />
                                      <div className="h-[1px] w-full bg-[#e5e5e5]" />
                                      <div className="h-[1px] w-full bg-[#e5e5e5]" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* MARKS */}
                              <div className="rounded-full border border-[#dcdcdc] px-4 py-1 text-sm font-semibold text-[#333]">
                                {question.marks} Marks
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-20 flex items-center justify-between border-t border-[#dcdcdc] pt-8">
              <div>
                <p className="text-sm text-[#777]">
                  Generated by VedaAI
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-[#777]">
                  Page 1
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-center gap-5 pb-14">
        <Button
          variant="outline"
          onClick={onReset}
          className="h-[58px] rounded-full border border-[#111111] bg-[#111111] px-10 text-[18px] text-white hover:bg-black"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Create New
        </Button>

        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="h-[58px] rounded-full border border-[#111111] bg-[#111111] px-12 text-[18px] text-white hover:bg-black"
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-5 w-5" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {message ? (
        <p className="pb-10 text-center text-[#777]">
          {message}
        </p>
      ) : null}
    </div>
  )
}