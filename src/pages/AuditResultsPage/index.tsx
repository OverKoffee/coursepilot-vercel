import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { AuditResultsResponse } from "../../types/planning";
import styles from "./AuditResultsPage.module.css";

interface CompletedCourse {
  course_code: string;
  credits: number | null;
}

export default function AuditResultsPage() {
  const [auditResults, setAuditResults] = useState<AuditResultsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const loadAuditResults = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setShouldRedirect(true);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("completed_courses")
        .select("course_code, credits")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        setShouldRedirect(true);
        setIsLoading(false);
        return;
      }

      const completedCourses = data as CompletedCourse[];

      const acceptedCourses = completedCourses.map((course) => course.course_code);

      const totalCredits = completedCourses.reduce(
        (sum, course) => sum + (course.credits ?? 0),
        0,
      );

      const mockRemainingRequirements = ["CMSC 320", "CMSC 335"];

      setAuditResults({
        session_id: "supabase-session",
        total_transferred_credits: totalCredits,
        accepted_courses: acceptedCourses,
        needs_review_courses: [],
        remaining_requirements: mockRemainingRequirements,
      });

      setIsLoading(false);
    };

    void loadAuditResults();
  }, []);

  if (isLoading) {
    return <p style={{ padding: "2rem" }}>Loading audit results...</p>;
  }

  if (shouldRedirect || !auditResults) {
    return <Navigate to="/upload" replace />;
  }

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
          <h1 className={styles.title}>Audit Results</h1>
        </div>

        <div className={styles.summaryCard}>
          <h2 className={styles.sectionTitle}>Summary</h2>

          <div className={styles.creditRow}>
            <span className={styles.creditValue}>
              {auditResults.total_transferred_credits}
            </span>
            <span className={styles.creditLabel}>total credits transferred</span>
          </div>

          <p className={styles.summaryMeta}>
            {auditResults.accepted_courses.length} eligible courses •{" "}
            {auditResults.needs_review_courses.length} manual reviews
          </p>
        </div>

        <div className={styles.topGrid}>
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Accepted</h3>
            <div className={styles.badgeSuccess}>Green state</div>

            {auditResults.accepted_courses.length > 0 ? (
              <ul className={styles.list}>
                {auditResults.accepted_courses.map((course) => (
                  <li key={course} className={styles.listItem}>
                    {course}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>No accepted courses.</p>
            )}
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Needs Review</h3>
            <div className={styles.badgeWarning}>Warning</div>

            {auditResults.needs_review_courses.length > 0 ? (
              <ul className={styles.list}>
                {auditResults.needs_review_courses.map((course) => (
                  <li key={course} className={styles.listItem}>
                    {course}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>No courses need review.</p>
            )}
          </div>
        </div>

        <div className={styles.panelWide}>
          <h3 className={styles.panelTitle}>Remaining Requirements</h3>

          {auditResults.remaining_requirements.length > 0 ? (
            <p className={styles.requirementsText}>
              {auditResults.remaining_requirements.join(" • ")}
            </p>
          ) : (
            <p className={styles.emptyText}>No remaining requirements.</p>
          )}
        </div>

        <Link
          to="/preferences"
          className={`btn btn-primary ${styles.continueButton}`}
        >
          Continue to scheduling
        </Link>
      </div>
    </section>
  );
}