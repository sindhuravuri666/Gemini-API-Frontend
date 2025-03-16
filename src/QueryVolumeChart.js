import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";

const COLORS = ["#3498db", "#f1c40f", "#e74c3c"];

const DashboardCharts = () => {
  const [queryData, setQueryData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);

  useEffect(() => {
    // Fetch query trends
    fetch("https://gemini-fastapi-server.onrender.com/query-trends")
      .then((res) => res.json())
      .then((data) => {
        setQueryData(
          data.map((item) => ({
            date: item.date,
            queries: item.query_count || 0,
          }))
        );
      })
      .catch((err) => console.error("Error fetching query trends:", err));

    // Fetch category distribution
    fetch(
      "https://gemini-fastapi-server.onrender.com/query-category-distribution"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Category API Response:", data);
        if (Array.isArray(data)) {
          setCategoryData(data);
        } else {
          console.error("Unexpected API format:", data);
          setCategoryData([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching query categories:", err);
        setCategoryData([]);
      })
      .catch((err) => console.error("Error fetching query categories:", err));
    // Fetch user engagement metrics (Radar chart) data
    fetch("https://gemini-fastapi-server.onrender.com/user-engagement")
      .then((res) => res.json())
      .then((data) => setEngagementData(data))
      .catch((err) => console.error("Error fetching engagement data:", err));
  }, []);

  return (
    <div className="flex flex-wrap justify-center items-center min-h-screen bg-gray-950 p-6 space-y-8">
      {/* 📊 Query Trend Line Chart */}
      <div className="w-full md:w-1/2 lg:w-1/3 bg-gray-900 p-6 rounded-xl shadow-xl">
        <h2 className="text-blue-400 text-lg font-bold mb-4">
          📊 Query Volume Over Time
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={queryData}
            style={{
              background: "#1E293B",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <CartesianGrid stroke="#2D3748" strokeDasharray="4 4" />
            <XAxis dataKey="date" stroke="#bbb" />
            <YAxis stroke="#bbb" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                color: "#fff",
                borderRadius: "8px",
                border: "1px solid #38bdf8",
              }}
            />
            <Line
              type="monotone"
              dataKey="queries"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ fill: "#38bdf8", r: 4 }}
              activeDot={{ r: 7, fill: "#60A5FA" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🍕 Query Category Pie Chart */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-white w-full md:w-2/3 lg:w-1/2 text-center">
          {/* Title with Emoji */}
          <h2 className="text-yellow-400 text-3xl font-bold mb-6 flex justify-center items-center">
            🍕 Query Categories Distribution
          </h2>

          {/* Dark-themed Pie Chart */}
          <div className="flex justify-center">
            <PieChart width={400} height={350}>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ category, percent }) =>
                  `${category} ${(percent * 100).toFixed(1)}%`
                }
                labelStyle={{ fill: "#fff", fontWeight: "bold" }}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend
                verticalAlign="bottom"
                height={50}
                iconSize={20}
                wrapperStyle={{ color: "#fff" }}
              />
            </PieChart>
          </div>

          {/* Description with Dark Theme */}
          <p className="text-gray-400 text-center text-sm mt-6">
            📊 The pie chart represents the distribution of query categories
            based on sentiment analysis. Each slice of the chart indicates the
            percentage of queries that fall under Positive, Negative, or Neutral
            sentiments. The dominant color highlights the most common sentiment
            in user queries.
          </p>
        </div>
      </div>

      {/* 📈 Smooth Area Chart */}
      <div className="w-full md:w-1/2 lg:w-1/3 bg-gray-900 p-6 rounded-xl shadow-xl">
        <h2 className="text-purple-400 text-lg font-bold mb-4">
          📈 Query Trends
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={queryData}>
            <defs>
              <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#bbb" />
            <YAxis stroke="#bbb" />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", color: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="queries"
              stroke="#a78bfa"
              fillOpacity={1}
              fill="url(#colorQueries)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 🚀 User Engagement Radar Chart */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1D] p-6">
        <div className="bg-[#222831] p-6 rounded-xl shadow-lg text-white w-full md:w-2/3 lg:w-1/2 text-center">
          <h2 className="text-yellow-400 text-3xl font-bold mb-6 flex justify-center items-center">
            🚀 User Engagement Overview
          </h2>

          <div className="flex flex-col items-center">
            <RadarChart
              cx={250}
              cy={200}
              outerRadius={150}
              width={500}
              height={400}
              data={engagementData}
            >
              <PolarGrid stroke="#6C757D" />
              <PolarAngleAxis
                dataKey="user_query"
                tick={{ fill: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#292929",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "10px",
                }}
                labelStyle={{ fontWeight: "bold", color: "#FFD700" }}
              />
              <Legend
                verticalAlign="top"
                align="center"
                wrapperStyle={{ color: "white", marginBottom: "20px" }}
              />
              <Radar
                name="Engagement Level"
                dataKey="count"
                //blue color
                stroke="#38bdf8"
                fill="#FFD700"
                fillOpacity={0.7}
              />
            </RadarChart>
          </div>

          <p className="text-gray-400 text-center text-sm mt-6">
            📊 This radar chart visualizes user engagement by tracking query
            frequency. Each axis represents a different type of user query. The
            larger the yellow area, the more frequently users ask about that
            topic.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
