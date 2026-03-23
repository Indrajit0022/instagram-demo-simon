"use client";

import { useState, useEffect, useRef } from "react";

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

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

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
    <div className="min-h-screen pb-20 selection:bg-white selection:text-black">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-50 h-[52px] border-b border-[#1C1C1C] bg-[#080808]/90 backdrop-blur px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#1C1C1C] flex items-center justify-center text-white text-[10px] font-bold">
            CI
          </div>
          <span className="instrument-serif text-white text-[14px]">
            Content Intelligence
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#444444] text-[12px]">
          <span className="w-2 h-2 rounded-full bg-[#444444]" />
          Gemini Flash 1.5
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-6">
        {/* 2. HERO */}
        {!result && !loading && (
          <section className="pt-20 pb-[60px] text-center">
            <div className="inline-block px-3 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded-full text-white text-[11px] mb-6">
              AI-Powered
            </div>
            <h1 className="instrument-serif text-white leading-tight mb-4 tracking-[-0.03em]" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              Drop a post.<br />
              <span className="text-[#888888]">Get a better one.</span>
            </h1>
            <p className="text-[#888888] text-[16px] max-w-[460px] mx-auto">
              Paste any public Instagram URL. We analyse what makes it work and write you a brand new version instantly.
            </p>
          </section>
        )}

        {/* 3. INPUT */}
        <div className={`transition-all duration-500 ${result || loading ? 'pt-12' : 'pt-0'}`}>
          <form 
            onSubmit={handleSubmit}
            className="mb-8 w-full bg-[#111111] border border-[#1C1C1C] rounded-[12px] p-1.5 pl-5 flex items-center gap-2 group focus-within:border-[#2A2A2A]"
          >
            <span className="text-[#444444] text-[14px]">🔗</span>
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              className="flex-1 bg-transparent border-none outline-none text-white text-[14px] placeholder:text-[#444444]"
            />
            <button
              type="submit"
              disabled={loading || !url}
              className={`px-[22px] py-[11px] rounded-[8px] text-[13px] font-semibold transition-all ${
                loading || !url 
                  ? "bg-[#1C1C1C] text-[#444444]" 
                  : "bg-white text-[#080808] hover:bg-[#EAEAEA]"
              }`}
            >
              Analyze →
            </button>
          </form>
        </div>

        {/* 4. LOADING */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="relative w-8 h-8 rounded-full border-[1.5px] border-[#2A2A2A] border-t-white animate-spin" />
            <div className="mt-4 text-[#888888] text-[14px]">
              {steps[loadingStep].text}
            </div>
            <div className="mt-2 text-[#444444] text-[12px]">
              Usually takes 10–20 seconds
            </div>
          </div>
        )}

        {/* 5. ERROR */}
        {error && (
          <div className="mb-5 bg-[#0F0000] border border-[#2D0000] rounded-[12px] p-[14px_18px] text-[#FF6666] text-[14px]">
            Error: {error}
          </div>
        )}

        {/* 6. RESULTS */}
        {result && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-4 animate-fade-up opacity-0 stagger-1">
              <label className="text-[#444444] text-[10px] uppercase tracking-[0.2em] mb-[-4px]">
                ORIGINAL — DECODED
              </label>
              
              <div className="bg-[#111111] border border-[#1C1C1C] rounded-[12px] p-[14px_16px]">
                <label className="text-[#444444] text-[10px] uppercase tracking-wide block mb-1.5">
                  HOOK IDENTIFIED
                </label>
                <p className="text-[#AAAAAA] italic text-[15px] leading-[1.4]">
                  "{result.analysis.hook}"
                </p>
              </div>

              <div className="bg-[#111111] border border-[#1C1C1C] rounded-[12px] p-[14px_16px]">
                <label className="text-[#444444] text-[10px] uppercase tracking-wide block mb-1.5">
                  CORE MESSAGE
                </label>
                <p className="text-white text-[14px]">
                  {result.analysis.mainIdea}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-[10px]">
                <div className="bg-[#111111] border border-[#1C1C1C] rounded-[12px] p-[14px_16px]">
                  <label className="text-[#444444] text-[10px] uppercase tracking-wide block mb-1.5">
                    STRUCTURE
                  </label>
                  <p className="text-white text-[13px]">
                    {result.analysis.structure}
                  </p>
                </div>
                <div className="bg-[#111111] border border-[#1C1C1C] rounded-[12px] p-[14px_16px]">
                  <label className="text-[#444444] text-[10px] uppercase tracking-wide block mb-1.5">
                    TONE
                  </label>
                  <p className="text-white text-[13px]">
                    {result.analysis.tone}
                  </p>
                </div>
              </div>

              <div className="bg-[#111111] border border-[#1C1C1C] border-l-white border-l-2 rounded-[12px] p-[14px_16px]">
                <label className="text-[#444444] text-[10px] uppercase tracking-wide block mb-1.5">
                  WHY IT WORKS
                </label>
                <p className="text-[#888888] text-[13px]">
                  {result.analysis.whatWorksWell}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-4 animate-fade-up opacity-0 stagger-3">
              <label className="text-[#444444] text-[10px] uppercase tracking-[0.2em] mb-[-4px]">
                YOUR NEW VERSION
              </label>

              <div className="bg-[#111111] border border-[#1C1C1C] rounded-[12px] p-[14px_16px]">
                <label className="text-[#444444] text-[10px] uppercase tracking-wide block mb-1.5">
                  NEW HOOK
                </label>
                <p className="instrument-serif text-white text-[17px] font-semibold tracking-[-0.01em]">
                  {result.rewrite.hook}
                </p>
              </div>

              <div className="flex-1 bg-[#111111] border border-[#1C1C1C] rounded-[12px] p-[14px_16px] flex flex-col">
                <label className="text-[#444444] text-[10px] uppercase tracking-wide block mb-1.5">
                  FULL CAPTION
                </label>
                <p className="text-white text-[14px] leading-[1.75] whitespace-pre-wrap">
                  {result.rewrite.caption}
                </p>
                
                <div className="h-px bg-[#1C1C1C] my-[14px]" />
                
                <label className="text-[#444444] text-[10px] uppercase tracking-wide block mb-1.5">
                  CALL TO ACTION
                </label>
                <p className="text-[#888888] text-[13px]">
                  {result.rewrite.cta}
                </p>

                <div className="h-px bg-[#1C1C1C] my-[14px]" />

                <label className="text-[#444444] text-[10px] uppercase tracking-wide block mb-1.5">
                  HASHTAGS (20)
                </label>
                <div className="flex flex-wrap gap-[5px]">
                  {result.rewrite.hashtags.map((tag, i) => (
                    <span 
                      key={i}
                      className="bg-[#1C1C1C] border border-[#2A2A2A] text-[#888888] text-[11px] px-2 py-0.5 rounded-[6px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full bg-white text-[#080808] text-[13px] font-bold py-[13px] rounded-[8px] transition-all hover:bg-[#EAEAEA]"
              >
                {copied ? "✓ Copied" : "Copy full caption"}
              </button>

              <button
                onClick={handleReset}
                className="w-full bg-transparent border border-[#1C1C1C] text-[#444444] text-[12px] py-[10px] rounded-[8px] transition-all hover:border-[#2A2A2A] hover:text-[#888888]"
              >
                Analyse another post
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
