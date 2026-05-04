import { describe, it, expect } from "vitest";
import type {
  AuditResultsResponse,
  ScheduleResultsResponse,
} from "../types/planning";

describe("planningApi", () => {
  it("analyzeTranscript returns audit results in the expected shape", () => {
    const result: AuditResultsResponse = {
      session_id: "mock-session-001",
      major: "Computer Science",
      minor: "Mathematics",
      completed_courses: [
        {
          course_code: "CMSC 105",
          course_name: "Introduction to Problem Solving and Algorithm Design",
          credits: 3,
          grade: "A",
        },
      ],
      total_completed_credits: 3,
      credits_remaining: 33,
      eligible_courses: [
        {
          course_code: "CMSC 115",
          course_name: "Introduction to Programming",
          credits: 3,
        },
      ],
      remaining_requirements: [
        {
          course_code: "CMSC 115",
          course_name: "Introduction to Programming",
          credits: 3,
        },
      ],
      needs_review_courses: [],
    };

    expect(result.session_id).toBe("mock-session-001");
    expect(result.completed_courses.length).toBeGreaterThan(0);
    expect(result.eligible_courses.length).toBeGreaterThan(0);
    expect(result.remaining_requirements.length).toBeGreaterThan(0);
  });

  it("generateScheduleOptions returns mock schedule results", () => {
    const result: ScheduleResultsResponse = {
      session_id: "mock-session-001",
      recommended_plan: {
        title: "Recommended Plan",
        recommended: true,
        semesters: [
          {
            term_label: "Fall 2026",
            courses: ["CMSC 115", "CMSC 215"],
          },
        ],
      },
      alternate_plans: ["Take a lighter first semester."],
      course_breakdown: ["Pace: moderate"],
    };

    expect(result.session_id).toBe("mock-session-001");
    expect(result.recommended_plan.title).toBe("Recommended Plan");
    expect(result.recommended_plan.semesters.length).toBeGreaterThan(0);
  });
});
