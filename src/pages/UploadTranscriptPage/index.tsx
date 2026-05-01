import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DragDropBox from "../../components/DragDropBox";
import { analyzeTranscript } from "../../services/planningApi";
import styles from "./UploadTranscriptPage.module.css";

const majors = [
  "Computer Science",
  "Cybersecurity Technology",
  "Software Development and Security",
  "Data Science",
];

const minors = [
  "",
  "Mathematics",
  "Computer Science",
  "Cybersecurity",
  "Business Administration",
];

export default function UploadTranscriptPage() {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [major, setMajor] = useState<string>("Computer Science");
  const [minor, setMinor] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileUpload = async () => {
    if (!file) {
      console.error("Missing file, disabled button should prevent this.");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const auditResults = await analyzeTranscript({
        file,
        major,
        minor: minor || undefined,
      });

      localStorage.setItem("session_id", auditResults.session_id);
      localStorage.setItem("audit_results", JSON.stringify(auditResults));
      localStorage.setItem("selected_major", major);
      localStorage.setItem("selected_minor", minor);

      navigate("/audit-results", {
        state: {
          auditResults,
          major,
          minor,
        },
      });
    } catch (err) {
      console.error("Error uploading transcript:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Error with analyzing the transcript.",
      );
    } finally {
      setIsUploading(false);
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
          <h1 className={styles.title}>Step 1: Upload transcript</h1>
          <p className={styles.subtitle}>
            PDF only. We extract course name, credits, and grade data.
          </p>
        </div>

        <div className={styles.uploadBlock}>
          <DragDropBox selectedFile={file} onFileSelect={setFile} />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="major" className={styles.label}>
            Major
          </label>
          <div className={styles.selectWrap}>
            <select
              id="major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className={styles.select}
            >
              {majors.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="minor" className={styles.label}>
            Minor
          </label>
          <div className={styles.selectWrap}>
            <select
              id="minor"
              value={minor}
              onChange={(e) => setMinor(e.target.value)}
              className={styles.select}
            >
              <option value="">Optional</option>
              {minors
                .filter((option) => option !== "")
                .map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleFileUpload}
          disabled={!file || isUploading}
          className={`btn btn-primary ${styles.button}`}
        >
          {isUploading ? "Analyzing..." : "Analyze Transcript"}
        </button>

        {errorMessage && (
          <div className={styles.resultsCard}>
            <h3 className={styles.resultsTitle}>Upload Error</h3>
            <div className={styles.resultItem}>
              <p className={styles.resultValue}>{errorMessage}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}