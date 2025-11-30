// src/QueryVolumeCharts.jsx
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Legend,
  Scatter,
  Customized,
} from "recharts";

const COLORS = ["#7DD3FC", "#B794F4", "#F472B6", "#FFD166", "#9AD2FF"];

const AnimatedDotSVG = ({ x, y, r = 4, fill = "#7DD3FC", keyProp }) => {
  if (x == null || y == null) return null;
  const id = `pulse-${keyProp || Math.random().toString(36).slice(2, 9)}`;
  return (
    <g>
      <style>{`
        @keyframes ${id} {
          0% { transform: scale(1); opacity: 1; }
          70% { transform: scale(1.6); opacity: 0.18; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <circle
        cx={x}
        cy={y}
        r={r * 2.6}
        fill={fill}
        opacity="0.12"
        style={{
          transformOrigin: `${x}px ${y}px`,
          animation: `${id} 1600ms infinite ease-in-out`,
        }}
      />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={fill}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1.2}
      />
    </g>
  );
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = cx + r * Math.cos(Math.PI / 2 - angleRad);
  const y = cy - r * Math.sin(Math.PI / 2 - angleRad);
  return { x, y };
}

export default function QueryVolumeCharts() {
  const [queryData, setQueryData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);

  useEffect(() => {
    fetch("https://gemini-fastapi-server.onrender.com/query-trends")
      .then((r) => r.json())
      .then((data) =>
        setQueryData(
          Array.isArray(data)
            ? data.map((d) => ({ date: d.date, queries: d.query_count || 0 }))
            : []
        )
      )
      .catch(() => setQueryData([]));

    fetch(
      "https://gemini-fastapi-server.onrender.com/query-category-distribution"
    )
      .then((r) => r.json())
      .then((data) => setCategoryData(Array.isArray(data) ? data : []))
      .catch(() => setCategoryData([]));

    fetch("https://gemini-fastapi-server.onrender.com/user-engagement")
      .then((r) => r.json())
      .then((data) => setEngagementData(Array.isArray(data) ? data : []))
      .catch(() => setEngagementData([]));
  }, []);

  const RADAR_TOP_N = 8;
  const radarData = [...engagementData]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, RADAR_TOP_N);

  const axisStroke = "#B5C7FF";
  const tooltipStyle = {
    backgroundColor: "rgba(2,8,20,0.92)",
    color: "#E6F0FF",
    borderRadius: 8,
    border: "1px solid rgba(125,211,252,0.12)",
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "18px 4vw 48px 4vw",
        color: "#E6F0FF",
        zIndex: 6,
        position: "relative",
      }}
    >
      <style>{`
        .stack { display:flex; flex-direction:column; gap:36px; }
        .chart-block { width:100%; min-height: 260px; }
        .chart-title { font-weight:700; color:#B5C7FF; margin:0 0 8px 0; display:flex; gap:10px; align-items:center; font-size:1.05rem; }
        .chart-sub { color: rgba(181,199,255,0.52); margin: 0 0 12px 0; font-size:0.92rem; }
        .recharts-surface, .recharts-wrapper { background: transparent !important; }
        .recharts-default-tooltip { background: rgba(2,8,20,0.92) !important; color: #E6F0FF !important; border-radius:8px !important; border:1px solid rgba(125,211,252,0.12) !important; }
        .recharts-cartesian-axis-tick-value { fill: #E6F0FF !important; opacity: 0.95; font-size: 12px; }
      `}</style>

      <div className="stack" role="region" aria-label="Query volume charts">
        {/* Line */}
        <section className="chart-block">
          <h3 className="chart-title">📊 Query Volume Over Time</h3>
          <div className="chart-sub">Recent query counts — X axis is date</div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={queryData}
                margin={{ top: 12, right: 28, left: 8, bottom: 8 }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,0.03)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="date"
                  stroke={axisStroke}
                  tick={{ fill: "#E6F0FF", fontSize: 12 }}
                />
                <YAxis
                  stroke={axisStroke}
                  tick={{ fill: "#E6F0FF", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#E6F0FF" }}
                />
                <Line
                  type="monotone"
                  dataKey="queries"
                  stroke="#7DD3FC"
                  strokeWidth={3}
                  dot={(props) => (
                    <AnimatedDotSVG
                      x={props.cx}
                      y={props.cy}
                      r={3.2}
                      fill="#7DD3FC"
                      keyProp={`line-${props.index}`}
                    />
                  )}
                  activeDot={{
                    r: 7,
                    fill: "#9AD2FF",
                    stroke: "#7DD3FC",
                    strokeWidth: 1.6,
                  }}
                  animationDuration={900}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Pie */}
        <section className="chart-block">
          <h3 className="chart-title">🍕 Query Categories Distribution</h3>
          <div className="chart-sub">Breakdown of categories</div>
          <div
            style={{
              height: 360,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={52}
                  paddingAngle={4}
                  startAngle={90}
                  endAngle={-270}
                  labelLine={false}
                  label={({ percent, payload }) =>
                    `${payload.category || payload.name || ""} ${(
                      percent * 100
                    ).toFixed(0)}%`
                  }
                  isAnimationActive={true}
                  animationDuration={1100}
                >
                  {categoryData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ color: "#B5C7FF" }}
                />

                <Customized
                  component={({ width, height }) => {
                    const total =
                      (categoryData || []).reduce(
                        (s, it) => s + (it.count || 0),
                        0
                      ) || 1;
                    const cx = width / 2,
                      cy = height / 2;
                    const radius = Math.min(width, height) * 0.5 * 0.75;
                    let angleCursor = 90;
                    return (
                      <g>
                        {(categoryData || []).map((d, idx) => {
                          const sweep = ((d.count || 0) / total) * 360;
                          const mid = angleCursor - sweep / 2;
                          angleCursor -= sweep;
                          const angleRad = (mid * Math.PI) / 180;
                          const x =
                            cx + radius * Math.cos(Math.PI / 2 - angleRad);
                          const y =
                            cy - radius * Math.sin(Math.PI / 2 - angleRad);
                          return (
                            <AnimatedDotSVG
                              key={`pie-dot-${idx}`}
                              x={x}
                              y={y}
                              r={6}
                              fill={COLORS[idx % COLORS.length]}
                              keyProp={`pie-${idx}`}
                            />
                          );
                        })}
                      </g>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Area */}
        <section className="chart-block">
          <h3 className="chart-title">📈 Query Trends</h3>
          <div className="chart-sub">
            Smoothed area — highlights trend peaks
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={queryData}
                margin={{ top: 12, right: 28, left: 8, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="6%" stopColor="#B794F4" stopOpacity={0.85} />
                    <stop offset="96%" stopColor="#B794F4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke={axisStroke}
                  tick={{ fill: "#E6F0FF", fontSize: 12 }}
                />
                <YAxis
                  stroke={axisStroke}
                  tick={{ fill: "#E6F0FF", fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                {/* Area */}
                <Area
                  type="monotone"
                  dataKey="queries"
                  stroke="#B794F4"
                  fill="url(#qGrad)"
                  animationDuration={1000}
                  isAnimationActive={true}
                />

                {/* Invisible line overlay to get accurate dot positions from the chart */}
                <Line
                  type="monotone"
                  dataKey="queries"
                  stroke="transparent"
                  dot={(props) => (
                    <AnimatedDotSVG
                      x={props.cx}
                      y={props.cy}
                      r={3.6}
                      fill="#B794F4"
                      keyProp={`area-${props.index}`}
                    />
                  )}
                  isAnimationActive={false}
                />

                <Scatter data={queryData} dataKey="queries" fill="#B794F4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Radar */}
        <section className="chart-block">
          <h3 className="chart-title">🚀 User Engagement</h3>
          <div className="chart-sub">
            Top {radarData.length} query types by frequency
          </div>
          <div style={{ height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius={140}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="user_query"
                  tick={{ fill: "#E6F0FF", fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "#B5C7FF" }} />
                <Radar
                  name="Engagement"
                  dataKey="count"
                  stroke="#7DD3FC"
                  fill="#F472B6"
                  fillOpacity={0.48}
                  isAnimationActive={true}
                  animationDuration={1200}
                  dot={(props) => (
                    // props will include cx, cy for each radar vertex — use AnimatedDotSVG
                    <AnimatedDotSVG
                      x={props.cx}
                      y={props.cy}
                      r={5}
                      fill="#7DD3FC"
                      keyProp={`radar-${props.index}`}
                    />
                  )}
                />

                <Customized
                  component={({
                    width,
                    height,
                    cx = width / 2,
                    cy = height / 2,
                  }) => {
                    const maxValue = Math.max(
                      ...radarData.map((d) => d.count || 0),
                      1
                    );
                    const total = radarData.length || 1;
                    const outer = Math.min(width, height) * 0.42;
                    return (
                      <g>
                        {radarData.map((d, i) => {
                          const angleDeg = 90 - (360 * i) / total;
                          const rScaled = ((d.count || 0) / maxValue) * outer;
                          const { x, y } = polarToCartesian(
                            cx,
                            cy,
                            rScaled,
                            angleDeg
                          );
                          return (
                            <AnimatedDotSVG
                              key={`radar-dot-${i}`}
                              x={x}
                              y={y}
                              r={5}
                              fill="#7DD3FC"
                              keyProp={`radar-${i}`}
                            />
                          );
                        })}
                      </g>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
