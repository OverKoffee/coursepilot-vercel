import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { generateScheduleOptions } from "../../services/planningApi";
import type {
  AuditResultsResponse,
  SchedulePreferences,
} from "../../types/planning";
import styles from "./PreferencesPage.module.css";

const enrollmentPaceOptions: {
  label: string;
  description: string;
  value: SchedulePreferences["enrollment_pace"];
}[] = [
  { label: "Full time", description: "12 credits / semester", value: "heavy" },
  {
    label: "Half time",
    description: "9 credits / semester",
    value: "moderate",
  },
  { label: "Part time", description: "6 credits / semester", value: "light" },
];

const outsideCommitmentOptions: {
  label: string;
  description: string;
  value: SchedulePreferences["outside_commitments"];
}[] = [
  {
    label: "Low",
    description: "School is my main focus",
    value: "school_only",
  },
  {
    label: "Medium",
    description: "Part-time work or family",
    value: "work_family",
  },
  {
    label: "High",
    description: "Full-time job or major obligations",
    value: "major_obligations",
  },
];

const courseIntensityOptions: {
  label: string;
  description: string;
  value: SchedulePreferences["course_intensity"];
}[] = [
  {
    label: "Lighter load",
    description: "Spread out the harder courses",
    value: "lighter_load",
  },
  {
    label: "Balanced",
    description: "Mix of easier and harder",
    value: "balanced",
  },
  {
    label: "Intensive",
    description: "Group the hard courses together",
    value: "intensive",
  },
];

const graduationMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseStoredGraduation(targetGraduation?: string): {
  month: string;
  year: string;
} {
  if (!targetGraduation) {
    return { month: "May", year: "2028" };
  }

  const [month = "May", year = "2028"] = targetGraduation.split(" ");
  return { month, year };
}

function readAuditResults(): AuditResultsResponse | null {
  const storedAuditResults =
    localStorage.getItem("audit_results") ??
    sessionStorage.getItem("coursepilot_audit_context");

  if (!storedAuditResults) {
    return null;
  }

  return JSON.parse(storedAuditResults) as AuditResultsResponse;
}

export default function PreferencesPage() {
  const navigate = useNavigate();

  const storedSessionId = localStorage.getItem("session_id");
  const storedPreferences = localStorage.getItem("schedule_preferences");
  const parsedStoredAuditResults = readAuditResults();

  const parsedStoredPreferences: SchedulePreferences | null = storedPreferences
    ? (JSON.parse(storedPreferences) as SchedulePreferences)
    : null;

  const defaultGraduation = parseStoredGraduation(
    parsedStoredPreferences?.target_graduation,
  );

  const [enrollmentPace, setEnrollmentPace] = useState<
    SchedulePreferences["enrollment_pace"]
  >(parsedStoredPreferences?.enrollment_pace ?? "moderate");

  const [outsideCommitments, setOutsideCommitments] = useState<
    SchedulePreferences["outside_commitments"]
  >(parsedStoredPreferences?.outside_commitments ?? "work_family");

  const [courseIntensity, setCourseIntensity] = useState<
    SchedulePreferences["course_intensity"]
  >(parsedStoredPreferences?.course_intensity ?? "balanced");

  const [graduationMonth, setGraduationMonth] = useState(
    defaultGraduation.month,
  );
  const [graduationYear, setGraduationYear] = useState(defaultGraduation.year);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const graduationYears = useMemo(
    () => Array.from({ length: 8 }, (_, index) => String(2026 + index)),
    [],
  );

  const sessionId = storedSessionId ?? parsedStoredAuditResults?.session_id;

  if (!sessionId) {
    return <Navigate to="/upload" replace />;
  }

  const handleContinue = async () => {
    const preferences: SchedulePreferences = {
      enrollment_pace: enrollmentPace,
      outside_commitments: outsideCommitments,
      course_intensity: courseIntensity,
      target_graduation: `${graduationMonth} ${graduationYear}`,
    };

    setIsGenerating(true);
    setErrorMessage("");

    try {
      localStorage.setItem("session_id", sessionId);
      localStorage.setItem("schedule_preferences", JSON.stringify(preferences));

      const scheduleResults = await generateScheduleOptions({
        sessionId,
        preferences,
      });

      localStorage.setItem("schedule_results", JSON.stringify(scheduleResults));

      navigate("/results", {
        state: {
          scheduleResults,
        },
      });
    } catch (err) {
      console.error("Error generating schedule options:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while generating schedule options.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className={`page ${styles.page}`}>
      <div className={`card ${styles.card}`}>
        <div className={styles.brandRow}>
          <img
            src="/Course_Pilot_Logo.png"
            alt="CoursePilot Logo"
            className={styles.logo}
          />
          <span className={styles.brandText}>CoursePilot</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Build your schedule</h1>

          {parsedStoredAuditResults ? (
            <p className={styles.summaryLine}>
              {parsedStoredAuditResults.credits_remaining} credits remaining •{" "}
              {parsedStoredAuditResults.eligible_courses.length} eligible now
            </p>
          ) : null}
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Enrollment Pace</h2>

          <div className={styles.optionGrid}>
            {enrollmentPaceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setEnrollmentPace(option.value)}
                className={`${styles.optionCard} ${
                  enrollmentPace === option.value ? styles.optionCardActive : ""
                }`}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.optionDescription}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>

          <p className={styles.sectionHint}>
            UMGC cap: 18 credits/semester across Session A and Session B
            combined.
          </p>
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Outside Commitments</h2>

          <div className={styles.optionGrid}>
            {outsideCommitmentOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setOutsideCommitments(option.value)}
                className={`${styles.optionCard} ${
                  outsideCommitments === option.value
                    ? styles.optionCardActive
                    : ""
                }`}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.optionDescription}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Preferred Course Intensity</h2>

          <p className={styles.sectionHint}>
            How comfortable are you with heavier coursework — whether that means
            dense reading, lab work, problem sets, or writing assignments?
          </p>

          <div className={styles.optionGrid}>
            {courseIntensityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCourseIntensity(option.value)}
                className={`${styles.optionCard} ${
                  courseIntensity === option.value
                    ? styles.optionCardActive
                    : ""
                }`}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.optionDescription}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Target Graduation</h2>

          <div className={styles.selectGrid}>
            <label className={styles.selectLabel}>
              <span>Month</span>

              <div className={styles.selectWrap}>
                <select
                  value={graduationMonth}
                  onChange={(event) => setGraduationMonth(event.target.value)}
                  className={styles.select}
                >
                  {graduationMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className={styles.selectLabel}>
              <span>Year</span>

              <div className={styles.selectWrap}>
                <select
                  value={graduationYear}
                  onChange={(event) => setGraduationYear(event.target.value)}
                  className={styles.select}
                >
                  {graduationYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        </div>

        {errorMessage && (
          <div className={styles.errorCard}>
            <p className={styles.errorText}>{errorMessage}</p>
          </div>
        )}

        <div className={styles.actions}>
          <Link
            to="/audit-results"
            className={`btn btn-secondary ${styles.actionButton}`}
          >
            Back
          </Link>

          <button
            type="button"
            onClick={handleContinue}
            className={`btn btn-primary ${styles.actionButton}`}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate my schedule options"}
          </button>
        </div>
      </div>
    </section>
  );
}
