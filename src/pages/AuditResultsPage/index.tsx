import { Link, Navigate, useLocation } from "react-router-dom";
import type { AuditResultsResponse } from "../../types/planning";
import styles from "./AuditResultsPage.module.css";

interface LocationState {
  auditResults?: AuditResultsResponse;
}

export default function AuditResultsPage() {
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;

  const storedAuditResults =
    sessionStorage.getItem("coursepilot_audit_context") ??
    localStorage.getItem("audit_results");

  const parsedStoredAuditResults = storedAuditResults
    ? (JSON.parse(storedAuditResults) as AuditResultsResponse)
    : null;

  const auditResults = state?.auditResults ?? parsedStoredAuditResults;

  if (!auditResults) {
    return <Navigate to="/upload" replace />;
  }

  localStorage.setItem("session_id", auditResults.session_id);
  localStorage.setItem("audit_results", JSON.stringify(auditResults));

  const declaredProgram = [auditResults.major, auditResults.minor]
    .filter(Boolean)
    .join(" • ");

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
          <p className={styles.subtitle}>
            Review what is still left and which courses are ready to schedule
            next.
          </p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Summary</h2>
              {declaredProgram ? (
                <p className={styles.summaryProgram}>{declaredProgram}</p>
              ) : null}
            </div>
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>
                {auditResults.credits_remaining}
              </span>
              <span className={styles.metricLabel}>credits remaining</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricValue}>
                {auditResults.eligible_courses.length}
              </span>
              <span className={styles.metricLabel}>eligible right now</span>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3 className={styles.panelTitle}>Eligible Courses</h3>
              <p className={styles.panelSubtitle}>
                These are the options we can use in schedule generation while
                the backend planning flow is still mocked.
              </p>
            </div>
          </div>

          {auditResults.eligible_courses.length > 0 ? (
            <div className={styles.courseGrid}>
              {auditResults.eligible_courses.map((course) => (
                <article key={course.course_code} className={styles.courseCard}>
                  <div className={styles.courseTopRow}>
                    <h4 className={styles.courseCode}>{course.course_code}</h4>

                    <span className={styles.creditPill}>
                      {course.credits} credits
                    </span>
                  </div>

                  <p className={styles.courseTitle}>
                    {course.course_name || "Course title pending"}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No eligible courses yet.</p>
          )}
        </div>

        <div className={styles.footerNote}>
          <p className={styles.footerText}>
            Your upload session is stored, so you can move into scheduling
            preferences next.
          </p>
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
