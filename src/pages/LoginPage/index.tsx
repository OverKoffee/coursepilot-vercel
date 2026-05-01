import { useState } from "react";
import { signInWithRedirect } from "aws-amplify/auth";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  const handleCognitoLogin = async () => {
    setMessage("Redirecting to login...");

    try {
      await signInWithRedirect();
    } catch (error) {
      console.error(error);
      setMessage("Unable to start login.");
    }
  };

  return (
    <section className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.topBar}>
          <div className={styles.brand}>
            <img
              src="/Course_Pilot_Logo.png"
              alt="CoursePilot Logo"
              className={styles.logo}
            />
            <span className={styles.brandText}>CoursePilot</span>
          </div>

          <button
            type="button"
            className={`btn btn-secondary ${styles.helpButton}`}
          >
            Help
          </button>
        </div>

        <div className={styles.hero}>
          <h1 className={styles.title}>Welcome</h1>
          <p className={styles.subtitle}>
            Sign in to access your transfer-credit analysis and degree planning.
          </p>
        </div>

        <div className={styles.form}>
          <button
            type="button"
            onClick={handleCognitoLogin}
            className={`btn btn-primary ${styles.primaryButton}`}
          >
            Sign in with Cognito
          </button>
        </div>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </section>
  );
}