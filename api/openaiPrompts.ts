/*
 Creating this file for:
    - transcript analysis prompt
    - schedule generation prompt
    - shared JSON schemas
*/

// TODO: We need to refine this prompt to get the best results.
export const transcriptAnalysisPrompt = `
You are analyzing a college transcript PDF for CoursePilot.

Extract only courses that are clearly completed or accepted as transfer credit.

Return structured JSON only.

Rules:
- Use the course code exactly as shown, such as "CMSC 451".
- Extract the course title when visible.
- Extract credits as a number.
- Extract the grade exactly as shown.
- Treat transfer grades such as "T", "TR", "TA", or "Transfer" as completed.
- Treat passing letter grades A, B, C, D, including plus/minus variants, as completed.
- Do not include courses with grades/statuses such as "IP", "In Progress", "W", "Withdrawn", "F", "Failed", "Planned", "Registered", or "Enrolled".
- Do not include summary rows, GPA rows, credit totals, notes, program names, or degree names.
- Do not invent missing courses.
- Do not duplicate the same course code. If the same course appears more than once, keep the most recent completed attempt.
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