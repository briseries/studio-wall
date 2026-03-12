import { useState } from "react";
import { supabase } from "../lib/supabase";

const T = {
  display: "'Archivo Black',sans-serif",
  body: "'Playfair Display',serif",
};

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setCheckEmail(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  }

  if (checkEmail) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Check your email</h1>
          <p style={styles.subtitle}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and log in.
          </p>
          <button
            style={styles.btn}
            onClick={() => { setCheckEmail(false); setMode("login"); }}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Studio Wall</h1>
        <p style={styles.subtitle}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "..." : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <button
          type="button"
          style={styles.googleBtn}
          onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
        >
          Sign in with Google
        </button>

        <p style={styles.toggle}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            style={styles.link}
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080810",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    background: "#12121C",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "48px 40px",
    width: "min(400px, 100%)",
    textAlign: "center",
  },
  title: {
    fontFamily: T.display,
    fontSize: 28,
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: T.body,
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 32,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    fontFamily: T.body,
    fontSize: 14,
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
  },
  btn: {
    fontFamily: T.display,
    fontSize: 13,
    padding: "12px 0",
    borderRadius: 10,
    border: "none",
    background: "#A87EFA",
    color: "#fff",
    cursor: "pointer",
    marginTop: 8,
  },
  error: {
    fontFamily: T.body,
    fontSize: 12,
    color: "#FF5C5C",
    margin: 0,
  },
  toggle: {
    fontFamily: T.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginTop: 20,
  },
  link: {
    color: "#A87EFA",
    cursor: "pointer",
    textDecoration: "underline",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    fontFamily: T.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
  },
  googleBtn: {
    fontFamily: T.display,
    fontSize: 13,
    padding: "12px 0",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    cursor: "pointer",
    width: "100%",
  },
};
