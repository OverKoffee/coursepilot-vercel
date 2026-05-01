export interface AuditResultsResponse {
  session_id: string;
  total_transferred_credits: number;
  accepted_courses: string[];
  needs_review_courses: string[];
  remaining_requirements: string[];
}

export interface SchedulePreferences {
  enrollment_pace: "light" | "moderate" | "heavy";
  outside_commitments: "school_only" | "work_family" | "major_obligations";
  course_intensity: "lighter_load" | "balanced" | "intensive";
  target_graduation: string;
}

export interface PlannedSemester {
  term_label: string;
  courses: string[];
}

export interface SchedulePlan {
  title: string;
  recommended: boolean;
  semesters: PlannedSemester[];
}

export interface ScheduleResultsResponse {
  session_id: string;
  recommended_plan: SchedulePlan;
  alternate_plans: string[];
  course_breakdown: string[];
}