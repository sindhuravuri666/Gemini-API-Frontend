// src/App.jsx
import React, { useState, useCallback } from "react";
import QueryVolumeCharts from "./QueryVolumeCharts"; // <-- fixed import (plural)
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

import {
  Button,
  TextField,
  CircularProgress,
  Typography,
  Container,
  Paper,
  Box,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Galaxy-themed MUI palette (deep blues, violets and magentas)
const galaxyTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7DD3FC" }, // light blue
    secondary: { main: "#F472B6" }, // pink
    background: { default: "#020617", paper: "rgba(255,255,255,0.03)" },
    text: { primary: "#E6F0FF", secondary: "#B5C7FF" },
  },
  typography: {
    fontFamily: "Inter, Roboto, 'Segoe UI', sans-serif",
  },
});

export default function OrionGalaxyApp() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState("");

  // particles - tsparticles setup
  const particlesInit = useCallback(async (engine) => {
    // If loadFull causes engine.checkVersion errors in your setup,
    // remove loadFull(engine) and use Particles without init.
    try {
      await loadFull(engine);
    } catch (e) {
      // swallow — fallback: particles still render without plugins
      // console.warn("tsparticles loadFull failed:", e);
    }
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://gemini-fastapi-server.onrender.com/analyze",
        { user_query: query },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      setResponse(res.data.generated_text);
    } catch (error) {
      console.error("Error fetching:", error);
      setResponse("❌ Error analyzing text.");
    }
    setLoading(false);
  };

  const handleSentiment = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://gemini-fastapi-server.onrender.com/sentiment",
        { text: query },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      setSentiment(res.data.sentiment);
    } catch (error) {
      console.error("Error fetching sentiment:", error);
      setSentiment("❌ Sentiment analysis failed.");
    }
    setLoading(false);
  };

  return (
    <ThemeProvider theme={galaxyTheme}>
      {/* Global galaxy CSS injected here so the file is self-contained */}
      <style>{`
        /* full-screen galaxy background with subtle animated nebula */
        .galaxy-root {
          min-height: 100%;
          height: auto;
          padding-bottom: 300px; /* space for charts */
          position: relative;

          background: radial-gradient(ellipse at 20% 10%, rgba(124,58,237,0.14), transparent 7%),
                      radial-gradient(ellipse at 90% 80%, rgba(236,72,153,0.10), transparent 10%),
                      linear-gradient(180deg, #001021 0%, #020617 60%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 32px 0 80px 0;
          color: #E6F0FF;
        }

        /* force parent/root transparency so charts inherit galaxy bg */
        html, body, #root { background: transparent !important; }
        .MuiContainer-root, .MuiPaper-root { background: transparent !important; }
        .recharts-wrapper, .recharts-surface, .recharts-wrapper > div { background: transparent !important; }

        /* drifting nebula overlay for subtle motion */
        .nebula {
          position: absolute;
          inset: -10%;
          background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.09), transparent 10%),
                      radial-gradient(circle at 70% 70%, rgba(236,72,153,0.06), transparent 12%);
          filter: blur(40px) saturate(120%);
          animation: drift 20s linear infinite;
          z-index: 0;
          pointer-events: none;
        }

        @keyframes drift {
          0% { transform: translate3d(-5%, -2%, 0) rotate(0.02deg); }
          50% { transform: translate3d(5%, 2%, 0) rotate(-0.02deg); }
          100% { transform: translate3d(-5%, -2%, 0) rotate(0.02deg); }
        }

        /* glass panel */
        .glass-card {
          position: relative;
          z-index: 6;
          backdrop-filter: blur(8px) saturate(130%);
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.04);
          box-shadow: 0 10px 40px rgba(2,6,23,0.6);
        }

        .app-title {
          letter-spacing: 1px;
          text-transform: uppercase;
          text-shadow: 0 6px 18px rgba(124,58,237,0.2), 0 2px 6px rgba(124,58,237,0.08);
        }

        .neon-accent {
          background: linear-gradient(90deg,#7DD3FC,#B794F4,#F472B6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .response-box pre, .response-box code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace;
          font-size: 0.95rem;
        }

        /* rounded neon buttons */
        .btn-neon {
          border-radius: 999px;
          padding-left: 18px;
          padding-right: 18px;
          box-shadow: 0 6px 20px rgba(34,197,94,0.03), inset 0 -2px 8px rgba(0,0,0,0.18);
        }

        /* small responsive tweaks */
        @media (max-width: 920px) {
          .paper-inner { padding: 18px; }
        }

        /* global pulsing animation used by chart dots */
        @media (prefers-reduced-motion: no-preference) {
          .pulse {
            transform-origin: center;
            animation: orion-pulse 1600ms infinite cubic-bezier(.2,.9,.2,1);
          }

          @keyframes orion-pulse {
            0%   { transform: scale(1);   opacity: 1; }
            70%  { transform: scale(1.6); opacity: 0.18; }
            100% { transform: scale(1);   opacity: 1; }
          }
        }

        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .pulse { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <Box className="galaxy-root">
        <div className="nebula" />

        {/* Particles (stars) - behind content */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false, zIndex: 1 },
            background: { color: { value: "transparent" } },
            particles: {
              number: { value: 160, density: { enable: true, area: 900 } },
              color: { value: ["#9AD2FF", "#DDB6FF", "#F8A3C4"] },
              shape: { type: "circle" },
              opacity: { value: { min: 0.05, max: 0.9 } },
              size: { value: { min: 0.4, max: 2.4 } },
              move: {
                enable: true,
                speed: 0.2,
                direction: "none",
                outMode: "out",
              },
              twinkle: {
                particles: { enable: true, frequency: 0.01, opacity: 1 },
              },
            },
            interactivity: {
              detect_on: "canvas",
              events: { onhover: { enable: false } },
            },
            detectRetina: true,
          }}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />

        {/* Main card */}
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 6 }}>
          <Paper
            elevation={4}
            className="glass-card paper-inner"
            sx={{ p: 4, borderRadius: 3 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mb: 1,
              }}
            >
              <div>
                <Typography
                  variant="h3"
                  className="app-title neon-accent"
                  sx={{ fontWeight: 800 }}
                >
                  Orion
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "text.secondary" }}
                >
                  Unleash the power of AI — analyze, understand & predict ✨
                </Typography>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0" stopColor="#7DD3FC" />
                      <stop offset="1" stopColor="#F472B6" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="url(#g1)"
                    strokeWidth="1.4"
                  />
                </svg>
              </motion.div>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              variant="filled"
              label="Enter your text here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{
                mb: 2,
                borderRadius: 2,
                background: "rgba(255,255,255,0.02)",
              }}
            />

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                onClick={handleAnalyze}
                variant="contained"
                color="primary"
                className="btn-neon"
              >
                Analyze
              </Button>
              <Button
                onClick={handleSentiment}
                variant="outlined"
                color="secondary"
                className="btn-neon"
              >
                Sentiment
              </Button>

              {loading && <CircularProgress size={28} sx={{ ml: 1 }} />}

              <Box sx={{ flex: 1 }} />

              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Powered by Orion • {new Date().getFullYear()}
              </Typography>
            </Box>

            {response && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }} className="neon-accent">
                  📜 Response
                </Typography>
                <Paper
                  className="response-box"
                  sx={{ p: 2, mt: 1, borderRadius: 2 }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {response}
                  </ReactMarkdown>
                </Paper>
              </Box>
            )}

            {sentiment && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }} className="neon-accent">
                  💬 Sentiment Analysis
                </Typography>
                <Paper
                  sx={{ p: 2, mt: 1, borderRadius: 2, textAlign: "center" }}
                >
                  <Typography
                    sx={{
                      color: sentiment.includes("positive")
                        ? "#4CAF50"
                        : sentiment.includes("negative")
                        ? "#FF5252"
                        : "#FFC107",
                    }}
                  >
                    {sentiment}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Container>

        {/* === IMPORTANT: put charts INSIDE galaxy-root so they sit on the same nebula/particles === */}
        <Box
          sx={{
            position: "relative",
            zIndex: 6,
            width: "100%",
            px: 3,
            pb: 6,
            pt: 6,
          }}
        >
          <Container
            maxWidth="lg"
            sx={{ position: "relative", background: "transparent" }}
          >
            <QueryVolumeCharts />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
