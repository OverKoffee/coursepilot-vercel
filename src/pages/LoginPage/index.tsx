import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/upload", { replace: true });
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
        </div>

        <div className={styles.hero}>
          <h1 className={styles.title}>Sign in to continue planning</h1>
          <p className={styles.subtitle}>
            Access your transcript review, degree audit, and schedule builder.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <label className={styles.fieldGroup}>
            <span className={styles.label}>Email</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              autoComplete="email"
            />
          </label>

          <label className={styles.fieldGroup}>
            <span className={styles.label}>Password</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            disabled={!email || !password || isLoading}
            className={`btn btn-primary ${styles.primaryButton}`}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </section>
  );
}
