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

Use the provided audit results, course catalog, prerequisites, planning date, and student preferences to generate a realistic semester-by-semester course plan.

Rules:
- Return structured JSON only.
- Only schedule courses from audit_context.remaining_requirements.
- Do not schedule completed courses again.
- Do not invent courses.
- Every scheduled course must exist in the provided course catalog.
- Respect prerequisites strictly.
- A course may only be scheduled if all of its prerequisites are either already completed or scheduled in an earlier semester.
- Do not place a course in the same semester as its prerequisite.
- Do not schedule CMSC 495 until CMSC 412, CMSC 430, and CMSC 451 are already completed or scheduled in earlier semesters.
- Use the provided planning_date as the current date.
- Do not base the schedule start year on transcript course years.
- Build the plan from the next reasonable academic term after planning_date.
- Use unique term_label values. Never return duplicate semester names such as two "Spring 2027" entries.
- Use normal academic term progression: Spring, Summer, Fall, then repeat by year.
- Use the target graduation date only as the desired completion deadline.
- Consider enrollment pace:
  - light = about 6 credits per semester
  - moderate = about 9 credits per semester
  - heavy = about 12 credits per semester
- Never exceed 18 credits in one semester.
- Consider outside commitments:
  - school_only can handle a heavier load
  - work_family should avoid overloaded semesters
  - major_obligations should use a lighter, safer plan
- Consider course intensity:
  - lighter_load should spread harder courses out
  - balanced should mix harder and easier courses
  - intensive may group harder courses when prerequisites allow
- If the target graduation date is unrealistic, still provide the best reasonable plan and explain the constraint briefly in course_breakdown.
- alternate_plans must be short plain-English alternatives, not full duplicate schedules.
- course_breakdown must be short plain-English notes explaining why the recommended plan makes sense.
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
