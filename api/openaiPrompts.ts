/*
 Creating this file for:
    - transcript analysis prompt
    - schedule generation prompt
    - shared JSON schemas
*/

export const transcriptAnalysisPrompt = `
You are analyzing a college transcript PDF for CoursePilot.

Extract courses that appear completed or accepted as transfer credit.

Return structured JSON only.

Rules:
- Use the course code exactly as shown, such as "CMSC 451".
- Extract the course title when visible.
- Extract credits as a number.
- Extract the grade exactly as shown.
- Treat transfer grades such as "T", "TR", "TA", or "Transfer" as completed.
- Extract completed letter-grade courses including A, B, C, D, and F, including plus/minus variants.
- Do not include courses with statuses such as "IP", "In Progress", "W", "Withdrawn", "Planned", "Registered", or "Enrolled".
- Do not include summary rows, GPA rows, credit totals, notes, program names, or degree names.
- Do not invent missing courses.
- Do not duplicate the same course code. If the same course appears more than once, keep the most recent attempt.
- If a course title is not visible, use an empty string.
- If credits are not visible, infer 3 only if the course appears to be a standard 3-credit course.
- If grade is not visible but the course is clearly listed under accepted transfer credit, use "T".
`;

export const transcriptAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    courses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          course_code: { type: "string" },
          course_name: { type: "string" },
          credits: { type: "number" },
          grade: { type: "string" },
        },
        required: ["course_code", "course_name", "credits", "grade"],
      },
    },
  },
  required: ["courses"],
};

export const scheduleGenerationPrompt = `
You are CoursePilot's academic schedule planning assistant.

Use the provided audit results, course catalog, prerequisites, and student preferences to generate a realistic semester-by-semester course plan.

Rules:
- Only schedule courses from the remaining requirements.
- Prioritize eligible courses first.
- Respect prerequisites whenever possible.
- Do not schedule CMSC 495 until CMSC 412, CMSC 430, and CMSC 451 are completed or scheduled before it.
- Consider the student's enrollment pace, outside commitments, preferred course intensity, and target graduation.
- Avoid overloading students with too many difficult courses in the same semester unless the student selected an intensive pace.
- If the target graduation date is unrealistic, still provide the best reasonable plan and explain the constraint briefly.
- Include alternate plan explanations as short plain-English strings.
- Include course breakdown notes as short plain-English strings.
- Do not invent courses.
- Return structured JSON only.
`;

export const scheduleGenerationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    session_id: { type: "string" },
    recommended_plan: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        recommended: { type: "boolean" },
        semesters: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              term_label: { type: "string" },
              courses: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["term_label", "courses"],
          },
        },
      },
      required: ["title", "recommended", "semesters"],
    },
    alternate_plans: {
      type: "array",
      items: { type: "string" },
    },
    course_breakdown: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "session_id",
    "recommended_plan",
    "alternate_plans",
    "course_breakdown",
  ],
};
