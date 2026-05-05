import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ResultsPage from "./index";

describe("ResultsPage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    localStorage.setItem(
      "audit_results",
      JSON.stringify({
        session_id: "session-123",
        major: "Computer Science",
        completed_courses: [],
        total_completed_credits: 0,
        credits_remaining: 24,
        eligible_courses: [],
        remaining_requirements: [],
        needs_review_courses: [],
      }),
    );

    localStorage.setItem(
      "schedule_preferences",
      JSON.stringify({
        enrollment_pace: "moderate",
        outside_commitments: "work_family",
        course_intensity: "balanced",
        target_graduation: "May 2028",
      }),
    );
  });

  it("renders alternate plans and plan details from stored results", () => {
    localStorage.setItem(
      "schedule_results",
      JSON.stringify({
        session_id: "session-123",
        recommended_plan: {
          title: "Recommended Plan",
          recommended: true,
          semesters: [
            {
              term_label: "Fall 2026",
              courses: ["CMSC 215", "CMSC 255"],
            },
          ],
        },
        alternate_plans: ["Delay CMSC 255 until Spring 2027."],
        course_breakdown: ["Pace: moderate"],
      }),
    );

    render(
      <MemoryRouter initialEntries={["/results"]}>
        <Routes>
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /your schedule options/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/alternate plans/i)).toBeInTheDocument();
    expect(
      screen.getByText(/delay cmsc 255 until spring 2027\./i),
    ).toBeInTheDocument();
    expect(screen.getByText(/plan details/i)).toBeInTheDocument();
    expect(screen.getAllByText(/pace: moderate/i)).toHaveLength(2);
  });

  it("shows empty-state messaging when alternates and details are missing", () => {
    localStorage.setItem(
      "schedule_results",
      JSON.stringify({
        session_id: "session-123",
        recommended_plan: {
          title: "Recommended Plan",
          recommended: true,
          semesters: [
            {
              term_label: "Fall 2026",
              courses: ["CMSC 215"],
            },
          ],
        },
        alternate_plans: [],
        course_breakdown: [],
      }),
    );

    render(
      <MemoryRouter initialEntries={["/results"]}>
        <Routes>
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/no alternate plans were returned for this schedule/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /no additional planning notes were returned for this schedule/i,
      ),
    ).toBeInTheDocument();
  });
});
