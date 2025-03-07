import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // Change theme if needed
import { motion } from "framer-motion";
import QueryVolumeChart from "./QueryVolumeChart";

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

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
    background: { default: "#121212", paper: "#1e1e1e" },
    text: { primary: "#ffffff", secondary: "#90caf9" },
  },
});

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://gemini-fastapi-server.onrender.com/analyze",
        { user_query: query },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // Explicitly allowing all origins
          },
          //withCredentials: true, // If the API requires authentication
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
            "Access-Control-Allow-Origin": "*", // Explicitly allowing all origins
          },
          //withCredentials: true, // If the API requires authentication
        }
      );
      console.log(res);
      setSentiment(res.data.sentiment);
    } catch (error) {
      console.error("Error fetching sentiment:", error);
      setSentiment("❌ Sentiment analysis failed.");
    }
    setLoading(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.default",
          color: "text.primary",
          p: 3,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={5}
            sx={{ p: 4, textAlign: "center", borderRadius: 3 }}
          >
            <Typography
              variant="h3"
              gutterBottom
              sx={{ color: "#90caf9", fontWeight: "bold" }}
            >
              🚀 AI Sage
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ color: "#f48fb1" }}>
              "Unleash the Power of AI – Analyze, Understand, and Predict!"
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Enter your text here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ mb: 2, bgcolor: "#2c2c2c", borderRadius: 1 }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleAnalyze}
              sx={{ mr: 1 }}
            >
              Analyze
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={handleSentiment}
            >
              Sentiment
            </Button>

            {loading && <CircularProgress sx={{ mt: 2 }} />}

            {response && (
              <>
                <Typography variant="h5" sx={{ mt: 3, color: "secondary" }}>
                  📜 Response:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mt: 1,
                    backgroundColor: "#1e1e1e",
                    borderRadius: 2,
                    textAlign: "left",
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    color: "#ffffff",
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {response}
                  </ReactMarkdown>
                </Paper>
              </>
            )}

            {sentiment && (
              <>
                <Typography variant="h5" sx={{ mt: 3 }} color="primary">
                  💬 Sentiment Analysis:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mt: 1,
                    backgroundColor: "#2c2c2c",
                    borderRadius: 2,
                    fontFamily: "monospace",
                    textAlign: "center",
                    color: sentiment.includes("positive")
                      ? "#4CAF50"
                      : sentiment.includes("negative")
                      ? "#FF5252"
                      : "#FFC107",
                  }}
                >
                  {sentiment}
                </Paper>
              </>
            )}
          </Paper>
        </Container>
      </Box>
      <QueryVolumeChart />
    </ThemeProvider>
  );
}

export default App;
