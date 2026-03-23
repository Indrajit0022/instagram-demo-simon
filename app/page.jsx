"use client";

import { useState, useEffect, useRef } from "react";

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    height: "52px",
    borderBottom: "1px solid #1C1C1C",
    backgroundColor: "rgba(8, 8, 8, 0.9)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoBox: {
    width: "24px",
    height: "24px",
    backgroundColor: "#1C1C1C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: "bold",
  },
  headerText: {
    fontFamily: "var(--font-instrument)",
    color: "#FFFFFF",
    fontSize: "14px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#444444",
  },
  statusText: {
    color: "#444444",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 24px",
  },
  hero: {
    paddingTop: "80px",
    paddingBottom: "60px",
    textAlign: "center",
  },
  pill: {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#1C1C1C",
    border: "1px solid #2A2A2A",
    borderRadius: "99px",
    color: "#FFFFFF",
    fontSize: "11px",
    marginBottom: "24px",
  },
  h1: {
    fontFamily: "var(--font-instrument)",
    color: "#FFFFFF",
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    letterSpacing: "-0.03em",
    lineHeight: "1.1",
    marginBottom: "16px",
  },
  subtext: {
    color: "#888888",
    fontSize: "16px",
    maxWidth: "460px",
    margin: "0 auto",
    lineHeight: "1.5",
  },
  form: {
    marginBottom: "32px",
    width: "100%",
    backgroundColor: "#111111",
    border: "1px solid #1C1C1C",
    borderRadius: "12px",
    padding: "6px 6px 6px 20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#FFFFFF",
    fontSize: "14px",
    fontFamily: "var(--font-dm)",
  },
  analyseBtn: {
    backgroundColor: "#FFFFFF",
    color: "#080808",
    fontFamily: "var(--font-dm)",
    fontSize: "13px",
    fontWeight: "600",
    borderRadius: "8px",
    padding: "11px 22px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  disabledBtn: {
    backgroundColor: "#1C1C1C",
    color: "#444444",
    cursor: "not-allowed",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "80px 0",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "1.5px solid #2A2A2A",
    borderTop: "1.5px solid #FFFFFF",
    borderRadius: "50%",
    margin: "0 auto 16px",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#888888",
    fontSize: "14px",
    marginBottom: "8px",
  },
  loadingNote: {
    color: "#444444",
    fontSize: "12px",
  },
  error: {
    backgroundColor: "#0F0000",
    border: "1px solid #2D0000",
    borderRadius: "12px",
    padding: "14px 18px",
    color: "#FF6666",
    fontSize: "14px",
    marginBottom: "20px",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
  },
  label: {
    color: "#444444",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    marginBottom: "12px",
  },
  card: {
    backgroundColor: "#111111",
    border: "1px solid #1C1C1C",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "10px",
  },
  cardLabel: {
    color: "#444444",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "6px",
    display: "block",
  },
  hookText: {
    color: "#AAAAAA",
    fontStyle: "italic",
    fontSize: "15px",
    lineHeight: "1.4",
  },
  whiteText: {
    color: "#FFFFFF",
    fontSize: "14px",
  },
  smallWhiteText: {
    color: "#FFFFFF",
    fontSize: "13px",
  },
  whyItWorks: {
    backgroundColor: "#111111",
    border: "1px solid #1C1C1C",
    borderLeft: "2px solid #FFFFFF",
    borderRadius: "12px",
    padding: "14px 16px",
    color: "#888888",
    fontSize: "13px",
  },
  newHook: {
    fontFamily: "var(--font-instrument)",
    color: "#FFFFFF",
    fontSize: "17px",
    fontWeight: "600",
    letterSpacing: "-0.01em",
  },
  preWrap: {
    color: "#FFFFFF",
    fontSize: "14px",
    lineHeight: "1.75",
    whiteSpace: "pre-wrap",
  },
  divider: {
    height: "1px",
    backgroundColor: "#1C1C1C",
    margin: "14px 0",
  },
  secondaryTextSmall: {
    color: "#888888",
    fontSize: "13px",
  },
  hashtagChip: {
    backgroundColor: "#1C1C1C",
    border: "1px solid #2A2A2A",
    color: "#888888",
    fontSize: "11px",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  copyBtn: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    color: "#080808",
    fontSize: "13px",
    fontWeight: "700",
    borderRadius: "8px",
    padding: "13px",
    marginTop: "12px",
    border: "none",
    cursor: "pointer",
  },
  resetBtn: {
    width: "100%",
    backgroundColor: "transparent",
    color: "#444444",
    border: "1px solid #1C1C1C",
    borderRadius: "8px",
    padding: "10px",
    marginTop: "8px",
    fontSize: "12px",
    cursor: "pointer",
  }
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const steps = [
    { text: "Scraping post...", time: 0 },
    { text: "Analysing content...", time: 4000 },
    { text: "Rewriting caption...", time: 8000 },
  ];

  useEffect(() => {
    let timers = [];
    if (loading) {
      setLoadingStep(0);
      timers.push(
        setTimeout(() => setLoadingStep(1), steps[1].time),
        setTimeout(() => setLoadingStep(2), steps[2].time)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!url || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const fullText = `${result.rewrite.hook}\n\n${result.rewrite.caption}\n\n${result.rewrite.cta}\n\n${result.rewrite.hashtags.map(h => `#${h}`).join(" ")}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setResult(null);
    setUrl("");
    setError("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808" }}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={styles.logoBox}>CI</div>
          <span style={styles.headerText}>Content Intelligence</span>
        </div>
        <div style={styles.statusText}>
          <span style={styles.statusDot} />
          Gemini Flash 1.5
        </div>
      </header>

      <main style={styles.container}>
        {/* HERO */}
        {!result && !loading && (
          <section style={styles.hero}>
            <div style={styles.pill}>AI-Powered</div>
            <h1 style={styles.h1}>
              Drop a post.<br />
              <span style={{ color: "#888888" }}>Get a better one.</span>
            </h1>
            <p style={styles.subtext}>
              Paste any public Instagram URL. We analyse what makes it work and write you a brand new version instantly.
            </p>
          </section>
        )}

        {/* INPUT */}
        <div style={{ paddingTop: result || loading ? "48px" : "0", transition: "padding 0.5s ease" }}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <span style={{ color: "#444444" }}>🔗</span>
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              style={styles.input}
            />
            <button
              type="submit"
              disabled={loading || !url}
              style={{
                ...styles.analyseBtn,
                ...(loading || !url ? styles.disabledBtn : {})
              }}
            >
              Analyse →
            </button>
          </form>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <div style={styles.loadingText}>{steps[loadingStep].text}</div>
            <div style={styles.loadingNote}>Usually takes 10–20 seconds</div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={styles.error}>Error: {error}</div>
        )}

        {/* RESULTS */}
        {result && !loading && (
          <div style={styles.resultsGrid}>
            {/* LEFT COLUMN */}
            <div className="fade-up">
              <div style={styles.label}>ORIGINAL — DECODED</div>
              
              <div style={styles.card}>
                <span style={styles.cardLabel}>HOOK IDENTIFIED</span>
                <p style={styles.hookText}>"{result.analysis.hook}"</p>
              </div>

              <div style={styles.card}>
                <span style={styles.cardLabel}>CORE MESSAGE</span>
                <p style={styles.whiteText}>{result.analysis.mainIdea}</p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <div style={{ ...styles.card, flex: 1, marginBottom: 0 }}>
                  <span style={styles.cardLabel}>STRUCTURE</span>
                  <p style={styles.smallWhiteText}>{result.analysis.structure}</p>
                </div>
                <div style={{ ...styles.card, flex: 1, marginBottom: 0 }}>
                  <span style={styles.cardLabel}>TONE</span>
                  <p style={styles.smallWhiteText}>{result.analysis.tone}</p>
                </div>
              </div>

              <div style={styles.whyItWorks}>
                <span style={styles.cardLabel}>WHY IT WORKS</span>
                <p>{result.analysis.whatWorksWell}</p>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="fade-up-1">
              <div style={styles.label}>YOUR NEW VERSION</div>

              <div style={styles.card}>
                <span style={styles.cardLabel}>NEW HOOK</span>
                <p style={styles.newHook}>{result.rewrite.hook}</p>
              </div>

              <div style={styles.card}>
                <span style={styles.cardLabel}>FULL CAPTION</span>
                <p style={styles.preWrap}>{result.rewrite.caption}</p>
                
                <div style={styles.divider} />
                
                <span style={styles.cardLabel}>CALL TO ACTION</span>
                <p style={styles.secondaryTextSmall}>{result.rewrite.cta}</p>

                <div style={styles.divider} />

                <span style={styles.cardLabel}>HASHTAGS (20)</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "4px" }}>
                  {result.rewrite.hashtags.map((tag, i) => (
                    <span key={i} style={styles.hashtagChip}>{tag}</span>
                  ))}
                </div>
              </div>

              <button onClick={copyToClipboard} style={styles.copyBtn}>
                {copied ? "✓ Copied" : "Copy full caption"}
              </button>

              <button onClick={handleReset} style={styles.resetBtn}>
                Analyse another post
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
