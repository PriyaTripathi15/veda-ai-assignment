"use client"

import { useCallback, useMemo, useState } from "react"
import { format } from "date-fns"
import { useDropzone } from "react-dropzone"
import {
  Bell,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  Loader2,
  Plus,
  UploadCloud,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import type { AssessmentData } from "@/types/assessment"

interface AssessmentFormProps {
  onSubmit: (data: AssessmentData) => Promise<void> | void
  isGenerating: boolean
}

export function AssessmentForm({
  onSubmit,
  isGenerating,
}: AssessmentFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dueDate, setDueDate] = useState<Date>()
  const [instructions, setInstructions] = useState("")
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [className, setClassName] = useState("")
  const [duration, setDuration] = useState("")
  const [overrideQuestions, setOverrideQuestions] = useState("")
  const [overrideMarks, setOverrideMarks] = useState("")

  const [questionTypes, setQuestionTypes] = useState<
    Array<{
      id: string
      type: string
      count: string
      marks: string
    }>
  >([])

  const parseCount = (value: string) => {
    const num = Number(value)
    return Number.isNaN(num) ? 0 : num
  }

  const parseMarks = (value: string) => {
    const num = Number(value)
    return Number.isNaN(num) ? 0 : num
  }

  const totalQuestions = useMemo(() => {
    return questionTypes.reduce(
      (acc, item) => acc + parseCount(item.count),
      0
    )
  }, [questionTypes])

  const totalMarks = useMemo(() => {
    return questionTypes.reduce(
      (acc, item) =>
        acc + parseCount(item.count) * parseMarks(item.marks),
      0
    )
  }, [questionTypes])

  const parsedOverrideQuestions =
    overrideQuestions === ""
      ? totalQuestions
      : Number(overrideQuestions)

  const parsedOverrideMarks =
    overrideMarks === ""
      ? totalMarks
      : Number(overrideMarks)

  const isFormValid =
    Boolean(title.trim()) &&
    Boolean(subject.trim()) &&
    Boolean(dueDate) &&
    questionTypes.length > 0 &&
    totalQuestions > 0 &&
    totalMarks > 0 &&
    Number.isFinite(parsedOverrideQuestions) &&
    Number.isFinite(parsedOverrideMarks) &&
    parsedOverrideQuestions > 0 &&
    parsedOverrideMarks > 0

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg"],
        "application/pdf": [".pdf"],
      },
    })

  const updateQuestion = (
    id: string,
    field: "count" | "marks",
    value: string
  ) => {
    // allow only numbers
    if (!/^\d*$/.test(value)) return

    setQuestionTypes((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item

        return {
          ...item,
          [field]: value,
        }
      })
    )
  }

  const removeQuestionType = (id: string) => {
    setQuestionTypes((prev) =>
      prev.filter((item) => item.id !== id)
    )
  }

  const addQuestionType = () => {
    setQuestionTypes((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "mcq",
        count: "",
        marks: "",
      },
    ])
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!isFormValid) return

    await onSubmit({
      title: title || "Assignment",
      subject: subject || "Assignment",
      file,
      dueDate,
      instructions,
      questionType: "mixed",
      numberOfQuestions: parsedOverrideQuestions,
      totalMarks: parsedOverrideMarks,
      duration,
      className,
    })
  }

  return (
    <div className="min-h-screen bg-transparent py-8 md:py-12">
      <div className="flex justify-center">
        <main className="w-full max-w-[1100px] rounded-[40px] bg-white px-8 py-8 card-white">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-[#f1f1f1] pb-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5]"
              >
                <ChevronLeft className="h-5 w-5 text-[#555]" />
              </button>

              <h2 className="text-[24px] font-semibold text-[#232323]">
                Assignment
              </h2>
            </div>

            <div className="flex items-center gap-5">
              <button type="button" className="relative">
                <Bell className="h-5 w-5 text-[#232323]" />

                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-500" />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#e8e8e8]" />

                <span className="font-medium text-[#232323]">
                  John Doe
                </span>

                <ChevronDown className="h-4 w-4 text-[#555]" />
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div className="mt-8">
            <h1 className="text-[40px] font-semibold text-[#2a2a2a]">
              Create Assignment
            </h1>

            <p className="mt-1 text-[#9b9ba0]">
              Set up a new assignment for your students
            </p>

            <div className="mt-8 h-[5px] w-full rounded-full bg-[#ededed]">
              <div className="h-full w-[50%] rounded-full bg-[#5c5c5c]" />
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-[900px] rounded-[38px] bg-[#fbfbfb] p-8 card-white"
          >
            <div>
              <h3 className="text-[32px] font-semibold text-[#2b2b2b]">
                Assignment Details
              </h3>

              <p className="mt-1 text-[#9c9ca1]">
                Basic information about your assignment
              </p>
            </div>

            {/* INPUTS */}
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">
                  Title
                </Label>

                <Input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Assignment title"
                />
              </div>

              <div>
                <Label className="mb-2 block">
                  Subject
                </Label>

                <Input
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                  placeholder="Mathematics"
                />
              </div>

              <div>
                <Label className="mb-2 block">
                  Class / Section
                </Label>

                <Input
                  value={className}
                  onChange={(e) =>
                    setClassName(e.target.value)
                  }
                  placeholder="8th A"
                />
              </div>

              <div>
                <Label className="mb-2 block">
                  Duration
                </Label>

                <Input
                  value={duration}
                  onChange={(e) =>
                    setDuration(e.target.value)
                  }
                  placeholder="45 minutes"
                />
              </div>
            </div>

            {/* UPLOAD */}
            <div className="mt-8">
              {!file ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "cursor-pointer rounded-[30px] border border-dashed border-[#d9d9d9] bg-white px-6 py-16 text-center transition-all",
                    isDragActive && "border-black"
                  )}
                >
                  <input {...getInputProps()} />

                  <UploadCloud className="mx-auto h-10 w-10 text-[#232323]" />

                  <h4 className="mt-5 text-[24px] font-medium text-[#232323]">
                    Choose a file or drag & drop it here
                  </h4>

                  <p className="mt-2 text-[#a0a0a4]">
                    JPEG, PNG, upto 10MB
                  </p>

                  <Button
                    type="button"
                    className="mt-7 rounded-full bg-[#f5f5f5] px-8 text-[#222]"
                  >
                    Browse Files
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-[24px] border border-[#ececec] bg-white p-5">
                  <div>
                    <p className="font-medium text-[#222]">
                      {file.name}
                    </p>

                    <p className="text-sm text-[#8c8c91]">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded-full bg-[#f5f5f5] p-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* DATE */}
            <div className="mt-8">
              <Label className="mb-3 block">
                Due Date
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 w-full justify-between rounded-full",
                      !dueDate &&
                        "text-muted-foreground"
                    )}
                  >
                    {dueDate
                      ? format(dueDate, "dd-MM-yyyy")
                      : "DD-MM-YYYY"}

                    <CalendarIcon className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-auto p-0"
                >
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* QUESTION TYPES */}
            <div className="mt-10">
              <div className="mb-5 grid grid-cols-[1fr_170px_120px] gap-6">
                <h3 className="font-semibold text-black">
                  Question Type
                </h3>

                <h3 className="font-semibold text-black">
                  Questions
                </h3>

                <h3 className="font-semibold text-black">
                  Marks
                </h3>
              </div>

              <div className="space-y-5">
                {questionTypes.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_170px_120px] items-center gap-6"
                  >
                    {/* SELECT */}
                    <div className="flex items-center gap-3 text-black">
                      <Select
                        value={item.type}
                        onValueChange={(value) => {
                          setQuestionTypes((prev) =>
                            prev.map((q) =>
                              q.id === item.id
                                ? {
                                    ...q,
                                    type: value,
                                  }
                                : q
                            )
                          )
                        }}
                      >
                        <SelectTrigger className="h-14 rounded-full">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="mcq">
                            MCQ
                          </SelectItem>

                          <SelectItem value="short">
                            Short Questions
                          </SelectItem>

                          <SelectItem value="diagram">
                            Diagram Questions
                          </SelectItem>

                          <SelectItem value="numerical">
                            Numerical
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <button
                        type="button"
                        onClick={() =>
                          removeQuestionType(item.id)
                        }
                      >
                        <X className="h-5 w-5 text-[#555]" />
                      </button>
                    </div>

                    {/* COUNT */}
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={item.count}
                      onChange={(e) =>
                        updateQuestion(
                          item.id,
                          "count",
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className="h-14 rounded-full text-center"
                    />

                    {/* MARKS */}
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={item.marks}
                      onChange={(e) =>
                        updateQuestion(
                          item.id,
                          "marks",
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className="h-14 rounded-full text-center"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestionType}
                className="mt-7 flex items-center gap-3 text-[18px] font-medium text-black"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#232323] text-white">
                  <Plus className="h-5 w-5" />
                </div>

                Add Question Type
              </button>
            </div>

            {/* TOTALS */}
            <div className="mt-10 flex justify-end">
                <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-black">Total Questions:</span>

                  <Input
                    type="text"
                    inputMode="numeric"
                    value={overrideQuestions}
                    onChange={(e) =>
                      setOverrideQuestions(
                        e.target.value
                      )
                    }
                    placeholder={String(
                      totalQuestions
                    )}
                    className="w-28"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-black">Total Marks:</span>

                  <Input
                    type="text"
                    inputMode="numeric"
                    value={overrideMarks}
                    onChange={(e) =>
                      setOverrideMarks(
                        e.target.value
                      )
                    }
                    placeholder={String(
                      totalMarks
                    )}
                    className="w-28"
                  />
                </div>
              </div>
            </div>

            {/* INSTRUCTIONS */}
            <div className="mt-10">
              <Label className="mb-4 block">
                Additional Information
              </Label>

              <Textarea
                value={instructions}
                onChange={(e) =>
                  setInstructions(e.target.value)
                }
                placeholder="Generate a question paper..."
                className="min-h-[150px] rounded-[28px]"
              />
            </div>

            {/* SUBMIT */}
            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                disabled={
                  isGenerating || !isFormValid
                }
                className="h-14 rounded-full bg-black px-12 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Assignment"
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}