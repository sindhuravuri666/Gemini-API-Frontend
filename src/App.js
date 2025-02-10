import React, { useState } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [sentiment, setSentiment] = useState(null);

  const handleAnalyze = async () => {
    try {
      const res = await fetch(
        "https://gemini-fastapi-server.onrender.com/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ user_query: query }),
          mode: "cors", // Explicitly enable CORS
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.ai_response);
    } catch (error) {
      console.error("Error fetching:", error);
      setResponse("Error analyzing text.");
    }
  };

  const handleSentimentAnalysis = async () => {
    try {
      const res = await fetch(
        "https://gemini-fastapi-server.onrender.com/analyze_sentiment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: query }),
          mode: "cors",
        }
      );

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
