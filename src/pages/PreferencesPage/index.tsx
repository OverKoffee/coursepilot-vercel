import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { generateScheduleOptions } from "../../services/planningApi";
import type { SchedulePreferences } from "../../types/planning";
import styles from "./PreferencesPage.module.css";

const enrollmentPaceOptions: {
  label: string;
  value: SchedulePreferences["enrollment_pace"];
}[] = [
  { label: "Light", value: "light" },
  { label: "Moderate", value: "moderate" },
  { label: "Heavy", value: "heavy" },
];

const outsideCommitmentOptions: {
  label: string;
  value: SchedulePreferences["outside_commitments"];
}[] = [
  { label: "School only", value: "school_only" },
  { label: "Work / family", value: "work_family" },
  { label: "Major obligations", value: "major_obligations" },
];

const courseIntensityOptions: {
  label: string;
  value: SchedulePreferences["course_intensity"];
}[] = [
  { label: "Lighter load", value: "lighter_load" },
  { label: "Balanced", value: "balanced" },
  { label: "Intensive", value: "intensive" },
];

export default function PreferencesPage() {
  const navigate = useNavigate();

  const storedSessionId = localStorage.getItem("session_id");
  const storedPreferences = localStorage.getItem("schedule_preferences");

  const parsedStoredPreferences: SchedulePreferences | null = storedPreferences
    ? (JSON.parse(storedPreferences) as SchedulePreferences)
    : null;

  const [enrollmentPace, setEnrollmentPace] =
    useState<SchedulePreferences["enrollment_pace"]>(
      parsedStoredPreferences?.enrollment_pace ?? "moderate",
    );

  const [outsideCommitments, setOutsideCommitments] =
    useState<SchedulePreferences["outside_commitments"]>(
      parsedStoredPreferences?.outside_commitments ?? "work_family",
    );

  const [courseIntensity, setCourseIntensity] =
    useState<SchedulePreferences["course_intensity"]>(
      parsedStoredPreferences?.course_intensity ?? "balanced",
    );

  const [targetGraduation, setTargetGraduation] = useState<string>(
    parsedStoredPreferences?.target_graduation ?? "May 2028",
  );

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!storedSessionId) {
    return <Navigate to="/upload" replace />;
  }

  const handleContinue = async () => {
    const preferences: SchedulePreferences = {
      enrollment_pace: enrollmentPace,
      outside_commitments: outsideCommitments,
      course_intensity: courseIntensity,
      target_graduation: targetGraduation,
    };

    setIsGenerating(true);
    setErrorMessage("");

    try {
      localStorage.setItem("schedule_preferences", JSON.stringify(preferences));

      const scheduleResults = await generateScheduleOptions({
        sessionId: storedSessionId,
        preferences,
      });

      localStorage.setItem(
        "schedule_results",
        JSON.stringify(scheduleResults),
      );

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
          <p className={styles.subtitle}>
            Choose pace, commitments, and target graduation to generate valid
            options.
          </p>
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Enrollment Pace</h2>
          <div className={styles.buttonRow}>
            {enrollmentPaceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setEnrollmentPace(option.value)}
                className={`btn ${styles.optionButton} ${
                  enrollmentPace === option.value ? styles.optionButtonActive : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Outside Commitments</h2>
          <div className={styles.buttonRow}>
            {outsideCommitmentOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setOutsideCommitments(option.value)}
                className={`btn ${styles.optionButton} ${
                  outsideCommitments === option.value
                    ? styles.optionButtonActive
                    : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Course Intensity</h2>
          <div className={styles.buttonRow}>
            {courseIntensityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCourseIntensity(option.value)}
                className={`btn ${styles.optionButton} ${
                  courseIntensity === option.value
                    ? styles.optionButtonActive
                    : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.targetRow}>
            <h2 className={styles.sectionTitle}>Target Graduation</h2>

            <input
              type="text"
              value={targetGraduation}
              onChange={(e) => setTargetGraduation(e.target.value)}
              className={styles.targetInput}
              placeholder="May 2028"
            />
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
            {isGenerating ? "Generating..." : "Generate schedule options"}
          </button>
        </div>
      </div>
    </section>
  );
}