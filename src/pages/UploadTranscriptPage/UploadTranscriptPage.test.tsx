import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadTranscriptPage from "./index";
import { analyzeTranscript } from "../../services/planningApi";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../services/planningApi", () => ({
  analyzeTranscript: vi.fn(),
}));

vi.mock("../../components/DragDropBox", () => ({
  default: ({
    selectedFile,
    onFileSelect,
  }: {
    selectedFile: File | null;
    onFileSelect: (file: File | null) => void;
  }) => (
    <div>
      <p>{selectedFile ? selectedFile.name : "No file selected"}</p>
      <button
        type="button"
        onClick={() =>
          onFileSelect(
            new File(["fake PDF file"], "transcript.pdf", {
              type: "application/pdf",
            }),
          )
        }
      >
        Mock Select File
      </button>
    </div>
  ),
}));

describe("UploadTranscriptPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the page content", () => {
    render(<UploadTranscriptPage />);

    expect(
      screen.getByRole("heading", { name: /step 1: upload transcript/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/major/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minor/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /analyze transcript/i }),
    ).toBeInTheDocument();
  });

  it("keeps analyze button disabled until a file is selected", () => {
    render(<UploadTranscriptPage />);

    expect(
      screen.getByRole("button", { name: /analyze transcript/i }),
    ).toBeDisabled();
  });

  it("enables analyze button after a file is selected", async () => {
    const user = userEvent.setup();

    render(<UploadTranscriptPage />);

    await user.click(screen.getByRole("button", { name: /mock select file/i }));

    expect(screen.getByText("transcript.pdf")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /analyze transcript/i }),
    ).not.toBeDisabled();
  });

  it("calls analyzeTranscript, stores results, and navigates on success", async () => {
    const user = userEvent.setup();

    const mockAuditResults = {
      session_id: "00000000-0000-4000-8000-000000000001",
      major: "Data Science",
      minor: "Mathematics",
      completed_courses: [
        {
          course_code: "CMSC 150",
          course_name: "Introduction to Programming",
          credits: 3,
          grade: "A",
        },
      ],
      total_completed_credits: 3,
      credits_remaining: 3,
      eligible_courses: [
        {
          course_code: "CMSC 320",
          course_name: "Relational Database Concepts and Applications",
          credits: 3,
        },
      ],
      remaining_requirements: [
        {
          course_code: "CMSC 320",
          course_name: "Relational Database Concepts and Applications",
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

    vi.mocked(analyzeTranscript).mockResolvedValue(mockAuditResults);

    render(<UploadTranscriptPage />);

    await user.click(screen.getByRole("button", { name: /mock select file/i }));
    await user.selectOptions(screen.getByLabelText(/major/i), "Data Science");
    await user.selectOptions(screen.getByLabelText(/minor/i), "Mathematics");
    await user.click(
      screen.getByRole("button", { name: /analyze transcript/i }),
    );

    await waitFor(() => {
      expect(analyzeTranscript).toHaveBeenCalledTimes(1);
    });

    expect(analyzeTranscript).toHaveBeenCalledWith({
      file: expect.any(File),
      major: "Data Science",
      minor: "Mathematics",
    });

    expect(localStorage.getItem("session_id")).toBe(
      "00000000-0000-4000-8000-000000000001",
    );
    expect(localStorage.getItem("selected_major")).toBe("Data Science");
    expect(localStorage.getItem("selected_minor")).toBe("Mathematics");

    expect(mockNavigate).toHaveBeenCalledWith("/audit-results", {
      state: {
        auditResults: mockAuditResults,
        major: "Data Science",
        minor: "Mathematics",
      },
    });
  });

  it("shows an error message when transcript analysis fails", async () => {
    const user = userEvent.setup();

    vi.mocked(analyzeTranscript).mockRejectedValue(
      new Error("Upload failed with status 500"),
    );

    render(<UploadTranscriptPage />);

    await user.click(screen.getByRole("button", { name: /mock select file/i }));
    await user.click(
      screen.getByRole("button", { name: /analyze transcript/i }),
    );

    expect(
      await screen.findByText(/upload failed with status 500/i),
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
