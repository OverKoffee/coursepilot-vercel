import { supabase } from "../lib/supabase";
import type {
  SchedulePreferences,
  ScheduleResultsResponse,
} from "../types/planning";

export interface AnalyzeTranscriptParams {
  file: File;
  major: string;
  minor?: string;
}

export interface GenerateScheduleOptionsParams {
  sessionId: string;
  preferences: SchedulePreferences;
}

interface ParsedCourse {
  course_code: string;
  course_name: string;
  credits: number;
  grade: string;
}

export interface AnalyzeTranscriptResponse {
  session_id: string;
  total_transferred_credits: number;
  accepted_courses: string[];
  needs_review_courses: string[];
  remaining_requirements: string[];
}

const USE_MOCK_DATA = true;
const GENERATE_SCHEDULE_ENDPOINT = "http://localhost:8000/plan/options";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

function getMockScheduleResultsResponse(
  sessionId: string,
  preferences: SchedulePreferences,
): ScheduleResultsResponse {
  const recommendedPlan =
    preferences.enrollment_pace === "light"
      ? {
          title: "Recommended Plan",
          recommended: true,
          semesters: [
            {
              term_label: "Fall 2026",
              courses: ["CMSC 320", "STAT 200"],
            },
            {
              term_label: "Spring 2027",
              courses: ["CMSC 335", "Upper-level elective"],
            },
          ],
        }
      : preferences.enrollment_pace === "heavy"
        ? {
            title: "Recommended Plan",
            recommended: true,
            semesters: [
              {
                term_label: "Fall 2026",
                courses: ["CMSC 320", "CMSC 335", "STAT 200"],
              },
              {
                term_label: "Spring 2027",
                courses: ["Upper-level elective", "Capstone"],
              },
            ],
          }
        : {
            title: "Recommended Plan",
            recommended: true,
            semesters: [
              {
                term_label: "Fall 2026",
                courses: ["CMSC 320", "CMSC 335"],
              },
              {
                term_label: "Spring 2027",
                courses: ["STAT 200", "Upper-level elective"],
              },
              {
                term_label: "Fall 2027",
                courses: ["Capstone"],
              },
            ],
          };

  return {
    session_id: sessionId,
    recommended_plan: recommendedPlan,
    alternate_plans: [
      "Take one lighter semester first, then increase pace after completing CMSC 320.",
      "Front-load quantitative coursework early, then shift to upper-level electives.",
    ],
    course_breakdown: [
      `Enrollment pace: ${preferences.enrollment_pace}`,
      `Outside commitments: ${preferences.outside_commitments}`,
      `Course intensity: ${preferences.course_intensity}`,
      `Target graduation: ${preferences.target_graduation}`,
    ],
  };
}

export async function analyzeTranscript({
  file,
  major,
  minor,
}: AnalyzeTranscriptParams): Promise<AnalyzeTranscriptResponse> {
  console.log("1. Checking Supabase user...");
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    throw new Error("User not authenticated.");
  }

  console.log("2. Reading file...");
  const fileBuffer = await file.arrayBuffer();
  const fileBase64 = arrayBufferToBase64(fileBuffer);

  console.log("3. Calling API...");
  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, 30000);

  const aiResponse = await fetch("/api/analyze-transcript", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: controller.signal,
    body: JSON.stringify({
      fileBase64,
      fileName: file.name,
      major,
      minor,
    }),
  });

  window.clearTimeout(timeoutId);

  console.log("4. API response status:", aiResponse.status);

  if (!aiResponse.ok) {
    const errorData = (await aiResponse.json()) as { error?: string };
    throw new Error(errorData.error ?? "Transcript analysis failed.");
  }

  const analyzedTranscript = (await aiResponse.json()) as {
    courses: ParsedCourse[];
  };

  const parsedCourses = analyzedTranscript.courses;

  const { error: uploadError } = await supabase
    .from("transcript_uploads")
    .insert({
      user_id: user.id,
      file_name: file.name,
      parsed_text: `AI parsed ${parsedCourses.length} courses from ${file.name}.`,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: courseError } = await supabase
    .from("completed_courses")
    .insert(
      parsedCourses.map((course) => ({
        user_id: user.id,
        course_code: course.course_code,
        course_name: course.course_name,
        credits: course.credits,
        grade: course.grade,
      })),
    );

  if (courseError) {
    throw new Error(courseError.message);
  }

  return {
    session_id: crypto.randomUUID(),
    total_transferred_credits: parsedCourses.reduce(
      (sum, course) => sum + course.credits,
      0,
    ),
    accepted_courses: parsedCourses.map((course) => course.course_code),
    needs_review_courses: [],
    remaining_requirements: ["CMSC 320", "CMSC 335"],
  };
}

export async function generateScheduleOptions({
  sessionId,
  preferences,
}: GenerateScheduleOptionsParams): Promise<ScheduleResultsResponse> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 900));

    return getMockScheduleResultsResponse(sessionId, preferences);
  }

  const response = await fetch(GENERATE_SCHEDULE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      preferences,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Schedule generation failed with status ${response.status}`,
    );
  }

  return (await response.json()) as ScheduleResultsResponse;
}
