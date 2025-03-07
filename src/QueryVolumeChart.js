import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const QueryTrendChart = () => {
  const [data, setData] = useState([]); // State to store API data

  useEffect(() => {
    fetch("https://gemini-fastapi-server.onrender.com/query-trends")
      .then((response) => response.json())
      .then((result) => {
        console.log("Received Data:", result); // Debug API response
        const formattedData = result.map((item) => ({
          date: item.date, // Ensure API sends 'date' field
          queries: item.query_count || 0, // Expect 'query_count'
        }));
        setData(formattedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md">
      <h2 className="text-blue-400 text-xl font-bold flex items-center">
        📊 Query Volume Over Time
      </h2>
      {data.length === 0 ? (
        <p className="text-gray-500">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="queries"
              stroke="#8884d8"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default QueryTrendChart;
