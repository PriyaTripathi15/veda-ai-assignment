const QUESTION_TEMPLATES = {
  mcq: [
    "Which statement best describes {topic}?",
    "What is the most accurate explanation of {topic}?",
    "Which option is most closely related to {topic}?",
    "Select the correct answer about {topic}.",
  ],
  short: [
    "Explain the concept of {topic} in your own words.",
    "Describe how {topic} is applied in practical situations.",
    "Briefly discuss the significance of {topic}.",
    "Write a short note on {topic}.",
  ],
  long: [
    "Discuss {topic} in detail with examples.",
    "Explain the key principles and applications of {topic}.",
    "Analyse the importance of {topic} in real-world scenarios.",
    "Evaluate {topic} with supporting arguments.",
  ],
  "true-false": [
    "State whether the following statement is true or false: {topic} is essential in modern learning.",
    "True or False: {topic} always has the same impact in every context.",
    "Mark the statement about {topic} as true or false and justify your answer.",
    "True or False: {topic} can be ignored without affecting understanding.",
  ],
};

function normaliseText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTopic(data, sourceContext) {
  const candidates = [data.title, data.instructions, sourceContext, data.sourceFileName]
    .map(normaliseText)
    .filter(Boolean);

  for (const candidate of candidates) {
    const cleaned = candidate
      .replace(/assessment|assignment|question paper|paper/gi, "")
      .replace(/[^a-zA-Z0-9\s-]/g, " ")
      .trim();

    if (cleaned) {
      const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 4);
      if (words.length) {
        return words.join(" ");
      }
    }
  }

  return "the assigned topic";
}

function buildPrompt(data, topic, sourceContext) {
  const parts = [
    `Create a structured exam paper titled \"${normaliseText(data.title)}\".`,
    `Target topic: ${topic}.`,
    `Subject: ${normaliseText(data.subject || topic)}.`,
    `Class/Section: ${normaliseText(data.className || "unspecified")}.`,
    `Duration: ${normaliseText(data.duration || "derive a reasonable duration")}.`,
    `Question type: ${normaliseText(data.questionType)}.`,
    `Number of questions: ${Number(data.numberOfQuestions) || 0}.`,
    `Total marks: ${Number(data.marks) || 0}.`,
    `Instructions: ${normaliseText(data.instructions) || "None"}.`,
  ];

  if (sourceContext) {
    parts.push(`Reference content: ${sourceContext.slice(0, 600)}`);
  }

  return parts.join("\n");
}

function createSectionPlans(questionType, totalQuestions) {
  const type = normaliseText(questionType).toLowerCase();

  if (type === "mixed") {
    const sectionCounts = allocateCounts(totalQuestions, [4, 3, 3]);
    return [
      {
        name: "Section A",
        instructions: "Attempt all questions.",
        questionType: "mcq",
        difficulty: "easy",
        count: sectionCounts[0],
      },
      {
        name: "Section B",
        instructions: "Attempt all questions.",
        questionType: "short",
        difficulty: "medium",
        count: sectionCounts[1],
      },
      {
        name: "Section C",
        instructions: "Attempt all questions.",
        questionType: "long",
        difficulty: "hard",
        count: sectionCounts[2],
      },
    ].filter((section) => section.count > 0);
  }

  if (type === "short") {
    const sectionCounts = totalQuestions > 4 ? allocateCounts(totalQuestions, [6, 4]) : [totalQuestions];
    return sectionCounts.length === 1
      ? [
          {
            name: "Section A",
            instructions: "Attempt all questions.",
            questionType: "short",
            difficulty: "medium",
            count: sectionCounts[0],
          },
        ]
      : [
          {
            name: "Section A",
            instructions: "Attempt all questions.",
            questionType: "short",
            difficulty: "easy",
            count: sectionCounts[0],
          },
          {
            name: "Section B",
            instructions: "Attempt all questions.",
            questionType: "short",
            difficulty: "medium",
            count: sectionCounts[1],
          },
        ].filter((section) => section.count > 0);
  }

  if (type === "long") {
    const sectionCounts = totalQuestions > 2 ? allocateCounts(totalQuestions, [5, 5]) : [totalQuestions];
    return sectionCounts.length === 1
      ? [
          {
            name: "Section A",
            instructions: "Attempt all questions.",
            questionType: "long",
            difficulty: "hard",
            count: sectionCounts[0],
          },
        ]
      : [
          {
            name: "Section A",
            instructions: "Attempt all questions.",
            questionType: "long",
            difficulty: "medium",
            count: sectionCounts[0],
          },
          {
            name: "Section B",
            instructions: "Attempt all questions.",
            questionType: "long",
            difficulty: "hard",
            count: sectionCounts[1],
          },
        ].filter((section) => section.count > 0);
  }

  return [
    {
      name: "Section A",
      instructions: "Attempt all questions.",
      questionType: type === "true-false" ? "true-false" : "mcq",
      difficulty: "easy",
      count: totalQuestions,
    },
  ];
}

function allocateCounts(total, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const raw = weights.map((weight) => Math.floor((total * weight) / totalWeight));
  let remainder = total - raw.reduce((sum, value) => sum + value, 0);

  for (let index = 0; remainder > 0; index = (index + 1) % raw.length) {
    raw[index] += 1;
    remainder -= 1;
  }

  return raw;
}

function allocateMarks(totalMarks, questionCount) {
  if (questionCount <= 0) {
    return [];
  }

  const base = Math.floor(totalMarks / questionCount);
  const remainder = totalMarks - base * questionCount;

  return Array.from({ length: questionCount }, (_, index) => base + (index < remainder ? 1 : 0));
}

function buildQuestionText(questionType, topic, index, sourceContext) {
  const templates = QUESTION_TEMPLATES[questionType] || QUESTION_TEMPLATES.mcq;
  const template = templates[index % templates.length];
  const focusWord = sourceContext
    ? normaliseText(sourceContext)
        .split(/\s+/)
        .filter(Boolean)
        .find((word) => word.length > 4) || topic
    : topic;

  return template.replace(/\{topic\}/g, focusWord || topic);
}

function generateStructuredPaper(data) {
  const sourceContext = normaliseText(data.sourceContext);
  const topic = extractTopic(data, sourceContext);
  const prompt = buildPrompt(data, topic, sourceContext);
  const totalQuestions = Math.max(1, Number(data.numberOfQuestions) || 1);
  const totalMarks = Math.max(totalQuestions, Number(data.marks) || totalQuestions);
  const sectionPlans = createSectionPlans(data.questionType, totalQuestions);
  const sectionMarks = allocateCounts(totalMarks, sectionPlans.map((section) => section.count));

  let questionNumber = 1;

  const sections = sectionPlans.map((sectionPlan, sectionIndex) => {
    const marksAllocation = allocateMarks(sectionMarks[sectionIndex], sectionPlan.count);

    const questions = Array.from({ length: sectionPlan.count }, (_, questionIndex) => {
      const questionMarks = marksAllocation[questionIndex] || 1;
      const difficulty =
        sectionPlan.difficulty ||
        (questionIndex % 3 === 0 ? "easy" : questionIndex % 3 === 1 ? "medium" : "hard");

      return {
        id: questionNumber++,
        text: buildQuestionText(sectionPlan.questionType, topic, questionIndex, sourceContext),
        difficulty,
        marks: questionMarks,
      };
    });

    return {
      name: sectionPlan.name,
      instructions: sectionPlan.instructions,
      questions,
    };
  });

  const durationText = normaliseText(data.duration);
  const durationMinutes = durationText || `${Math.max(45, Math.min(180, totalMarks * 2))} minutes`;

  return {
    prompt,
    paper: {
      title: normaliseText(data.title),
      subject: normaliseText(data.subject || topic),
      className: normaliseText(data.className || ""),
      duration: durationMinutes,
      totalMarks,
      sections,
      studentInfo: {
        name: "________________________",
        rollNumber: "____________________",
        section: "____________________",
      },
      sourceSummary: sourceContext ? sourceContext.slice(0, 300) : "",
    },
  };
}

module.exports = {
  generateStructuredPaper,
  buildPrompt,
};