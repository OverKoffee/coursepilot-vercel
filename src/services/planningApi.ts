import type {
  // AuditResultsResponse,
  SchedulePreferences,
  ScheduleResultsResponse,
} from "../types/planning";

import { supabase } from "../lib/supabase";

export interface AnalyzeTranscriptParams {
  file: File;
  major: string;
  minor?: string;
}

export interface GenerateScheduleOptionsParams {
  sessionId: string;
  preferences: SchedulePreferences;
}

const USE_MOCK_DATA = true;
// const ANALYZE_TRANSCRIPT_ENDPOINT =
//   "https://jpmngsr48i.execute-api.us-west-2.amazonaws.com/dev/plan/start";
// "http://localhost:8000/plan/start";
const GENERATE_SCHEDULE_ENDPOINT = "http://localhost:8000/plan/options";

/*
Note: this endpoint performs both analyze and generate calls
const ORCHESTRATOR_ENDPOINT = "https://jpmngsr48i.execute-api.us-west-2.amazonaws.com"

Currently, using /dev/plan/start , CORS enabled for dev stage
*/

// function getMockAuditResultsResponse(
//   major: string,
//   minor?: string,
// ): AuditResultsResponse {
//   console.log("Generating mock audit results for:", {
//     major,
//     minor: minor || "None",
//   });

//   return {
//     session_id: "mock-session-001",
//     total_transferred_credits: 84,
//     accepted_courses: ["CMSC 150", "MATH 140", "ENGL 101"],
//     needs_review_courses: ["BIO 201", "HIST 210"],
//     remaining_requirements: [
//       "CMSC 320",
//       "CMSC 335",
//       "Upper-level elective",
//       "Capstone",
//     ],
//   };
// }

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
}: {
  file: File;
  major: string;
  minor?: string;
}) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Faking our parsed data for now until parser is ready
  const parsedCourses = [
    {
      course_code: "CMSC 131",
      course_name: "Programming I",
      credits: 3,
    },
    {
      course_code: "MATH 140",
      course_name: "Calculus I",
      credits: 4,
    },
  ];

  // Store transcript record
  const { error: uploadError } = await supabase
    .from("transcript_uploads")
    .insert({
      user_id: user.id,
      file_name: file.name,
      parsed_text: "Mock parsed transcript data",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // Store completed courses
  const { error: courseError } = await supabase
    .from("completed_courses")
    .insert(
      parsedCourses.map((c) => ({
        user_id: user.id,
        ...c,
      }))
    );

  if (courseError) {
    throw new Error(courseError.message);
  }

  // Return mock audit results
  return {
    session_id: "local-session-001",
    total_transferred_credits: 7,
    accepted_courses: parsedCourses.map((c) => c.course_code),
    remaining_requirements: ["CMSC 320", "CMSC 335"],
  };
}

export async function generateScheduleOptions({
  sessionId,
  preferences,
}: GenerateScheduleOptionsParams): Promise<ScheduleResultsResponse> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 900));

    console.log("Mock generateScheduleOptions called with:", {
      sessionId,
      preferences,
    });

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
    let errorMessage = `Schedule generation failed with status ${response.status}`;

    try {
      const errorData = (await response.json()) as { message?: string };
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // ignore
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as ScheduleResultsResponse;
}
