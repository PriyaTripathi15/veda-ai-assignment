import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

import type { GeneratedPaper } from "@/types/assessment"

interface QuestionPaperDocumentProps {
  paper: GeneratedPaper
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingHorizontal: 28,
    paddingBottom: 30,
    fontSize: 11,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    paddingBottom: 14,
    marginBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#4B5563",
  },
  className: {
    fontSize: 10,
    color: "#4B5563",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  metaBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 8,
  },
  metaLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 700,
  },
  section: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 4,
  },
  sectionInstructions: {
    fontSize: 9.5,
    color: "#6B7280",
    marginBottom: 8,
    fontStyle: "italic",
  },
  question: {
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  questionIndex: {
    fontWeight: 700,
  },
  questionMarks: {
    color: "#1D4ED8",
    fontWeight: 700,
  },
  badge: {
    marginTop: 2,
    fontSize: 8,
    color: "#374151",
  },
})

export function QuestionPaperDocument({ paper }: QuestionPaperDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{paper.title}</Text>
          <Text style={styles.subtitle}>{paper.subject}</Text>
          {paper.className ? <Text style={styles.className}>Class: {paper.className}</Text> : null}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>{paper.duration}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Total Marks</Text>
            <Text style={styles.metaValue}>{paper.totalMarks}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Name</Text>
            <Text style={styles.metaValue}>{paper.studentInfo.name}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Roll Number</Text>
            <Text style={styles.metaValue}>{paper.studentInfo.rollNumber}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Section</Text>
            <Text style={styles.metaValue}>{paper.studentInfo.section}</Text>
          </View>
        </View>

        {paper.sections.map((section) => (
          <View key={section.name} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.name}</Text>
            <Text style={styles.sectionInstructions}>{section.instructions}</Text>

            {section.questions.map((question, index) => (
              <View key={question.id} style={styles.question}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionIndex}>{index + 1}. {question.text}</Text>
                  <Text style={styles.questionMarks}>{question.marks} marks</Text>
                </View>
                <Text style={styles.badge}>Difficulty: {String(question.difficulty).toUpperCase()}</Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  )
}