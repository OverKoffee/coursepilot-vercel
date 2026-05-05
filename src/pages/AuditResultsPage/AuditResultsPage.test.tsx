import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AuditResultsPage from "./index";
import type { AuditResultsResponse } from "../../types/planning";

const auditResults: AuditResultsResponse = {
  session_id: "session-123",
  major: "Computer Science",
  minor: "Mathematics",
  completed_courses: [
    {
      course_code: "CMSC 105",
      course_name: "Introduction to Problem Solving and Algorithm Design",
      credits: 3,
      grade: "A",
    },
    {
      course_code: "CMSC 115",
      course_name: "Introduction to Programming",
      credits: 3,
      grade: "A",
    },
  ],
  total_completed_credits: 6,
  credits_remaining: 27,
  eligible_courses: [
    {
      course_code: "CMSC 215",
      course_name: "Intermediate Programming",
      credits: 3,
    },
  ],
  remaining_requirements: [
    {
      course_code: "CMSC 215",
      course_name: "Intermediate Programming",
      credits: 3,
    },
    {
      course_code: "CMSC 255",
      course_name: "Introduction to Object-Oriented Programming",
      credits: 3,
    },
  ],
  needs_review_courses: [
    {
      course_code: "BIO 201",
      course_name: "Biology I",
      credits: 4,
      grade: "D",
    },
  ],
};

describe("AuditResultsPage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("shows eligible, blocked, and review courses", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/audit-results",
            state: { auditResults },
          },
        ]}
      >
        <Routes>
          <Route path="/audit-results" element={<AuditResultsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /your audit results/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/eligible courses/i)).toBeInTheDocument();
    expect(screen.getByText(/remaining but blocked/i)).toBeInTheDocument();
    expect(
      screen.getByText(/missing prerequisites: cmsc 215/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/needs review/i)).toBeInTheDocument();
    expect(screen.getByText(/grade d/i)).toBeInTheDocument();
  });
});
