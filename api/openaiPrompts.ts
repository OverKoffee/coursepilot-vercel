/*
 Creating this file for:
    - transcript analysis prompt
    - schedule generation prompt
    - shared JSON schemas
*/

// TODO: We need to refine this prompt to get the best results.
export const transcriptAnalysisPrompt = `
You are analyzing a college transcript PDF for CoursePilot.

Extract only completed or transferred courses that appear on the transcript.

Return structured JSON only.

Rules:
- Use the course code exactly as shown, such as "CMSC 451".
- If a course title is not visible, use an empty string.
- If credits are not visible, infer 3 only if the course appears to be a standard 3-credit course.
- If grade is not visible, use "T" for transfer/completed.
- Do not invent courses.
- Do not include planned, in-progress, failed, withdrawn, or duplicate courses unless clearly completed.
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