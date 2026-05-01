import { describe, it, expect } from "vitest";
import { analyzeTranscript, generateScheduleOptions } from "./planningApi";

describe("planningApi", () => {
  it("analyzeTranscript returns mock audit results", async () => {
    const file = new File(["fake PDF file"], "transcript.pdf", {
      type: "application/pdf",
    });

    const result = await analyzeTranscript({
      file,
      major: "Computer Science",
      minor: "Mathematics",
    });

    expect(result.session_id).toBe("mock-session-001");
    expect(result.accepted_courses.length).toBeGreaterThan(0);
    expect(result.remaining_requirements.length).toBeGreaterThan(0);
  });

  it("generateScheduleOptions returns mock schedule results", async () => {
    const result = await generateScheduleOptions({
      sessionId: "mock-session-001",
      preferences: {
        enrollment_pace: "moderate",
        outside_commitments: "work_family",
        course_intensity: "balanced",
        target_graduation: "May 2028",
      },
    });

    expect(result.session_id).toBe("mock-session-001");
    expect(result.recommended_plan.title).toBe("Recommended Plan");
    expect(result.recommended_plan.semesters.length).toBeGreaterThan(0);
  });
});