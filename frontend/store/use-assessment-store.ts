import { create } from "zustand"

import type {
  AssignmentJobStatus,
  BackendAssignment,
  GeneratedPaper,
} from "@/types/assessment"

interface AssessmentState {
  currentAssignment: BackendAssignment | null
  generatedPaper: GeneratedPaper | null
  jobStatus: AssignmentJobStatus
  jobMessage: string
  socketConnected: boolean
  error: string | null
  showBuilder: boolean
  setShowBuilder: (show: boolean) => void
  setSocketConnected: (connected: boolean) => void
  setJobState: (status: AssignmentJobStatus, message?: string) => void
  setCurrentAssignment: (assignment: BackendAssignment | null) => void
  setGeneratedPaper: (paper: GeneratedPaper | null) => void
  applyServerUpdate: (update: {
    status: AssignmentJobStatus
    message?: string
    paper?: GeneratedPaper
    assignment?: BackendAssignment
  }) => void
  setError: (error: string | null) => void
  resetAssessment: () => void
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  currentAssignment: null,
  generatedPaper: null,
  jobStatus: "idle",
  jobMessage: "",
  socketConnected: false,
  error: null,
  setSocketConnected: (connected) => set({ socketConnected: connected }),
  showBuilder: false,
  setShowBuilder: (show) => set({ showBuilder: show }),
  setJobState: (status, message = "") => set({ jobStatus: status, jobMessage: message }),
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
  setGeneratedPaper: (paper) => set({ generatedPaper: paper }),
  applyServerUpdate: (update) =>
    set((state) => ({
      jobStatus: update.status,
      jobMessage: update.message || state.jobMessage,
      generatedPaper: update.paper || state.generatedPaper,
      currentAssignment: update.assignment || state.currentAssignment,
      error: update.status === "failed" ? update.message || "Generation failed" : null,
    })),
  setError: (error) => set({ error }),
  resetAssessment: () =>
    set({
      currentAssignment: null,
      generatedPaper: null,
      jobStatus: "idle",
      jobMessage: "",
      error: null,
    }),
}))