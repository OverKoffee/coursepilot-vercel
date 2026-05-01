import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
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
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />

          <button
            type="button"
            onClick={handleLogin}
            disabled={!email || !password || isLoading}
            className={`btn btn-primary ${styles.primaryButton}`}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </section>
  );
}