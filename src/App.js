import React, { useState } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [sentiment, setSentiment] = useState(null);

  const handleAnalyze = async () => {
    try {
      console.log("Starting analysis...");
      const res = await axios.post(
        "http://127.0.0.1:8000/analyze",
        { user_query: query } // Request body
      );
      console.log("Stopping Analysis...");

      if (res.status !== 200) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      setResponse(res.data.generated_text);
    } catch (error) {
      console.error("Error fetching:", error);
      setResponse("Error analyzing text.");
    }
  };

  const handleSentimentAnalysis = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: query }),
        mode: "cors",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setSentiment(data);
    } catch (error) {
      console.error("Error fetching sentiment:", error);
      setSentiment({ sentiment: "Error analyzing sentiment." });
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>AI Text Analyzer</h1>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your text here..."
        rows="5"
        cols="50"
      />
      <br />
      <button onClick={handleAnalyze} style={{ marginTop: "10px" }}>
        Analyze
      </button>
      <button onClick={handleSentimentAnalysis} style={{ marginLeft: "10px" }}>
        View Sentiment
      </button>
      <h2>Response:</h2>
      <p>{response}</p>
      {sentiment && (
        <div>
          <h2>Sentiment Analysis:</h2>
          <p>Sentiment Score: {sentiment.sentiment_score}</p>
          <p>Sentiment: {sentiment.sentiment}</p>
        </div>
      )}
    </div>
  );
}

export default App;
