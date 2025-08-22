import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SAMPLE_RIDDLE = {
  id: "local-1",
  text: "I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?",
  answer: "An Echo",
  likes: 0,
};

export default function Home() {
  const [riddle, setRiddle] = useState(SAMPLE_RIDDLE);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sleeping, setSleeping] = useState(false);

  async function fetchRiddle() {
    setLoading(true);
    setSleeping(false);
    setShowAnswer(false);
    try {
      const res = await fetch("/api/sphinx");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      // Expecting { id, text, answer, likes }
      setRiddle(data || SAMPLE_RIDDLE);
    } catch (err) {
      // If backend/AI fails show friendly message
      setSleeping(true);
      setRiddle(SAMPLE_RIDDLE);
    } finally {
      setLoading(false);
    }
  }

  async function likeRiddle() {
    // Optimistic UI update
    setRiddle((prev) => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    try {
      await fetch(`/api/sphinx/${riddle.id}/like`, { method: "POST" });
    } catch {
      // ignore — backend may not exist yet
    }
  }

  useEffect(() => {
    fetchRiddle();
  }, []);

  return (
    <>
      <Head>
        <title>Sphinx Riddles</title>
        <meta name="description" content="One riddle at a time — Sphinx Riddles" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.card} role="main">
          <header className={styles.header}>
            <h1 className={styles.title}>Sphinx Riddles</h1>
            <p className={styles.subtitle}>One riddle. No login. Dark, minimal, responsive.</p>
          </header>

          <section className={styles.riddleSection}>
            {loading ? (
              <div className={styles.message}>Loading...</div>
            ) : sleeping ? (
              <div className={styles.message}>Sphinx is sleeping</div>
            ) : (
              <>
                <div className={styles.riddleText} aria-live="polite">
                  {riddle.text}
                </div>

                <div className={styles.answer}>
                  {showAnswer ? (
                    <div className={styles.answerText}>{riddle.answer}</div>
                  ) : (
                    <button
                      className={styles.primary}
                      onClick={() => setShowAnswer(true)}
                      aria-label="Show Answer"
                    >
                      Show Answer
                    </button>
                  )}
                </div>

                <div className={styles.controls}>
                  {showAnswer && (
                    <button
                      className={styles.primary}
                      onClick={fetchRiddle}
                      aria-label="Next Riddle"
                    >
                      Next Riddle
                    </button>
                  )}

                  <button className={styles.secondary} onClick={likeRiddle} aria-label="Like">
                    ❤️ Like <span className={styles.likesCount}>{riddle.likes || 0}</span>
                  </button>
                </div>
              </>
            )}
          </section>

          <footer className={styles.footer}>
          </footer>
        </main>
      </div>
    </>
  );
}
