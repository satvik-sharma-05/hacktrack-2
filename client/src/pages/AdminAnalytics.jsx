// src/pages/AdminAnalytics.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import api from "../services/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { 
  FiUsers, 
  FiCalendar, 
  FiCheckCircle, 
  FiClock, 
  FiTrendingUp,
  FiPieChart,
  FiBarChart2,
  FiActivity,
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiAward,
  FiTarget,
  FiFileText,
  FiImage,
  FiFile
} from "react-icons/fi";
import { FaRobot, FaBolt, FaChartLine, FaNetworkWired } from "react-icons/fa";
import { exportChartData, getChartData, downloadManager } from "../utils/exportUtils";
import DownloadStatus from "../components/DownloadStatus";

const TRON_COLORS = [
  "#00f2fe", "#4facfe", "#00ff88", "#ff6b6b", 
  "#ffd93d", "#6c5ce7", "#a29bfe", "#fd79a8",
  "#81ecec", "#55efc4", "#ffeaa7", "#74b9ff"
];

const GLOW_EFFECTS = {
  cyan: "0 0 30px rgba(0, 242, 254, 0.4)",
  blue: "0 0 30px rgba(79, 172, 254, 0.4)",
  green: "0 0 30px rgba(0, 255, 136, 0.4)",
  purple: "0 0 30px rgba(108, 92, 231, 0.4)",
  orange: "0 0 30px rgba(255, 180, 0, 0.4)"
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [exportMenu, setExportMenu] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  async function fetchData() {
    try {
      const res = await api.get(`/admin/stats?range=${timeRange}`);
      setStats(res.data.stats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  const processedData = useMemo(() => {
    if (!stats) return null;

    return {
      ...stats,
      engagementMetrics: [
        { subject: 'Active Users', value: 85, fullMark: 100 },
        { subject: 'Event Creation', value: 70, fullMark: 100 },
        { subject: 'Participation', value: 90, fullMark: 100 },
        { subject: 'Content Views', value: 65, fullMark: 100 },
        { subject: 'Social Shares', value: 75, fullMark: 100 },
        { subject: 'Return Rate', value: 80, fullMark: 100 }
      ],
      performanceData: [
        { name: 'Mon', users: 400, events: 240, sessions: 300 },
        { name: 'Tue', users: 300, events: 139, sessions: 278 },
        { name: 'Wed', users: 200, events: 180, sessions: 189 },
        { name: 'Thu', users: 278, events: 390, sessions: 239 },
        { name: 'Fri', users: 189, events: 480, sessions: 349 },
        { name: 'Sat', users: 239, events: 380, sessions: 430 },
        { name: 'Sun', users: 349, events: 430, sessions: 410 }
      ]
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full animate-spin mx-auto"></div>
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="space-y-2">
            <p className="text-cyan-300 font-mono text-lg tracking-wider animate-pulse">
              LOADING ANALYTICS DASHBOARD
            </p>
            <p className="text-gray-400 text-sm font-mono">
              Processing platform metrics...
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <FaRobot className="text-6xl text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-xl font-mono">ANALYTICS DATA UNAVAILABLE</p>
          <p className="text-gray-400">Failed to load analytics data</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 lg:p-6">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 243, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 243, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Header Section */}
      <div className="relative mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div className="space-y-2">
       
            <p className="text-cyan-200/80 font-mono text-sm lg:text-base tracking-wider">
              REAL-TIME PLATFORM METRICS & PERFORMANCE INSIGHTS
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2 bg-gray-800/50 backdrop-blur-md rounded-xl p-1 border border-cyan-500/20">
              {["24h", "7d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 ${
                    timeRange === range
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-400/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-cyan-300 bg-gray-800/50 backdrop-blur-md rounded-xl px-4 py-2 border border-cyan-500/20">
              <FiRefreshCw className="text-cyan-400" />
              <span className="font-mono">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Animated underline */}
        <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <EnhancedStatCard
          icon={<FiUsers className="text-2xl" />}
          title="Total Users"
          value={processedData.totalUsers}
          color="cyan"
          change="+12%"
          description="Registered platform users"
        />
        <EnhancedStatCard
          icon={<FiCalendar className="text-2xl" />}
          title="Total Events"
          value={processedData.totalEvents}
          color="blue"
          change="+8%"
          description="Created events"
        />
        <EnhancedStatCard
          icon={<FiCheckCircle className="text-2xl" />}
          title="Approved Events"
          value={processedData.totalEvents - processedData.pendingEvents}
          color="green"
          change="+15%"
          description="Successfully approved"
        />
        <EnhancedStatCard
          icon={<FiClock className="text-2xl" />}
          title="Pending Events"
          value={processedData.pendingEvents}
          color="orange"
          change="+5%"
          description="Awaiting approval"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="space-y-8">
        {/* First Row - Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EnhancedChartContainer
            title="User Role Distribution"
            icon={<FiPieChart />}
            description="Breakdown of user roles across the platform"
            chartData={processedData.roleDistribution}
            chartType="roleDistribution"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processedData.roleDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {processedData.roleDistribution.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={TRON_COLORS[index % TRON_COLORS.length]} 
                      stroke="#1a1a1a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </EnhancedChartContainer>

          <EnhancedChartContainer
            title="Event Status Overview"
            icon={<FiBarChart2 />}
            description="Approved vs pending event distribution"
            chartData={[
              { 
                name: "Approved", 
                value: processedData.totalEvents - processedData.pendingEvents,
                fill: "#00ff88"
              },
              { 
                name: "Pending", 
                value: processedData.pendingEvents,
                fill: "#ffd93d"
              },
            ]}
            chartType="eventStatus"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={[
                  { 
                    name: "Approved", 
                    value: processedData.totalEvents - processedData.pendingEvents,
                    fill: "#00ff88"
                  },
                  { 
                    name: "Pending", 
                    value: processedData.pendingEvents,
                    fill: "#ffd93d"
                  },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  barSize={60}
                >
                  {[
                    { name: "Approved", fill: "#00ff88" },
                    { name: "Pending", fill: "#ffd93d" }
                  ].map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={entry.fill}
                      stroke="#1a1a1a"
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </EnhancedChartContainer>
        </div>

        {/* Add more chart containers as needed... */}
      </div>

      {/* Download Status Component */}
      <DownloadStatus />

      {/* Enhanced Global Styles */}
      <style jsx global>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .tron-card {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        .tron-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.6), transparent);
        }

        .tron-card-glow {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 16px;
          box-shadow: 
            0 0 20px rgba(34, 211, 238, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .tron-card-glow:hover {
          border-color: rgba(34, 211, 238, 0.6);
          box-shadow: 
            0 0 30px rgba(34, 211, 238, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Enhanced Stat Card Component
function EnhancedStatCard({ icon, title, value, color, change, description, index = 0 }) {
  const colorClasses = {
    cyan: "from-cyan-500 to-blue-500",
    blue: "from-blue-500 to-purple-500",
    green: "from-green-400 to-cyan-500",
    orange: "from-orange-400 to-red-400",
    purple: "from-purple-500 to-pink-500"
  };

  const glowColors = {
    cyan: GLOW_EFFECTS.cyan,
    blue: GLOW_EFFECTS.blue,
    green: GLOW_EFFECTS.green,
    orange: GLOW_EFFECTS.orange,
    purple: GLOW_EFFECTS.purple
  };

  return (
    <div 
      className="tron-card-glow p-6 animate-fade-in-up group cursor-pointer"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        boxShadow: glowColors[color]
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${
          change.startsWith('+') 
            ? 'text-green-400 bg-green-400/10 border-green-400/20' 
            : 'text-red-400 bg-red-400/10 border-red-400/20'
        }`}>
          {change}
        </span>
      </div>
      
      <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-white mb-2 font-mono">{value?.toLocaleString() || 0}</p>
      <p className="text-gray-500 text-xs">{description}</p>
      
      {/* Animated progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mt-4 overflow-hidden">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-2000 ease-out group-hover:animate-pulse`}
          style={{ width: `${Math.min((value / 1000) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

// Enhanced Chart Container Component with Working Downloads
function EnhancedChartContainer({ 
  title, 
  icon, 
  description, 
  chartData, 
  chartType,
  children 
}) {
  const containerRef = useRef(null);
  const [exportMenu, setExportMenu] = useState(false);

  const generateDownloadId = () => {
    return `download_${chartType}_${Date.now()}`;
  };

  const handleExportCSV = async () => {
    const downloadId = generateDownloadId();
    downloadManager.addDownload(downloadId, title, 'csv');
    
    try {
      downloadManager.updateProgress(downloadId, 50);
      const success = await exportChartData.toCSV(chartData, title);
      downloadManager.completeDownload(downloadId, success);
      
      if (!success) {
        alert(`Failed to export ${title} as CSV. Please try again.`);
      }
    } catch (error) {
      console.error('CSV export error:', error);
      downloadManager.completeDownload(downloadId, false);
      alert(`Error exporting CSV: ${error.message}`);
    }
  };

  const handleExportJSON = async () => {
    const downloadId = generateDownloadId();
    downloadManager.addDownload(downloadId, title, 'json');
    
    try {
      downloadManager.updateProgress(downloadId, 50);
      const success = await exportChartData.toJSON(chartData, title);
      downloadManager.completeDownload(downloadId, success);
      
      if (!success) {
        alert(`Failed to export ${title} as JSON. Please try again.`);
      }
    } catch (error) {
      console.error('JSON export error:', error);
      downloadManager.completeDownload(downloadId, false);
      alert(`Error exporting JSON: ${error.message}`);
    }
  };

  const handleExportPNG = async () => {
    if (!containerRef.current) {
      alert('Chart container not found');
      return;
    }

    const downloadId = generateDownloadId();
    downloadManager.addDownload(downloadId, title, 'png');
    
    try {
      downloadManager.updateProgress(downloadId, 30);
      const success = await exportChartData.toPNG(containerRef.current, title, {
        backgroundColor: '#111827',
        scale: 2
      });
      downloadManager.completeDownload(downloadId, success);
      
      if (!success) {
        alert(`Failed to export ${title} as PNG. Please try again.`);
      }
    } catch (error) {
      console.error('PNG export error:', error);
      downloadManager.completeDownload(downloadId, false);
      alert(`Error exporting PNG: ${error.message}`);
    }
  };

  const handleExportPDF = async () => {
    if (!containerRef.current) {
      alert('Chart container not found');
      return;
    }

    const downloadId = generateDownloadId();
    downloadManager.addDownload(downloadId, title, 'pdf');
    
    try {
      downloadManager.updateProgress(downloadId, 30);
      const success = await exportChartData.toPDF(containerRef.current, title, {
        backgroundColor: '#111827',
        scale: 2,
        orientation: 'landscape'
      });
      downloadManager.completeDownload(downloadId, success);
      
      if (!success) {
        alert(`Failed to export ${title} as PDF. Please try again.`);
      }
    } catch (error) {
      console.error('PDF export error:', error);
      downloadManager.completeDownload(downloadId, false);
      alert(`Error exporting PDF: ${error.message}`);
    }
  };

  const handleExportAll = async () => {
    if (!containerRef.current) return;

    const downloadId = generateDownloadId();
    downloadManager.addDownload(downloadId, title, 'all');
    
    try {
      downloadManager.updateProgress(downloadId, 25);
      await handleExportCSV();
      
      downloadManager.updateProgress(downloadId, 50);
      await handleExportPNG();
      
      downloadManager.updateProgress(downloadId, 75);
      await handleExportPDF();
      
      downloadManager.updateProgress(downloadId, 100);
      downloadManager.completeDownload(downloadId, true);
    } catch (error) {
      console.error('Batch export error:', error);
      downloadManager.completeDownload(downloadId, false);
    }
  };

  return (
    <div ref={containerRef} className="tron-card p-6 group" data-chart-container>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="text-cyan-200 text-sm">{description}</p>
          </div>
        </div>
        
        <div className="flex gap-2 relative">
          <button
            onClick={() => setExportMenu(!exportMenu)}
            className="p-2 bg-gray-700 hover:bg-cyan-600 rounded-lg transition-all duration-300 group/btn"
            title="Export Options"
          >
            <FiDownload className="text-gray-300 group-hover/btn:text-white transition-colors" />
          </button>
          
          {exportMenu && (
            <div className="absolute top-12 right-0 bg-gray-800 border border-cyan-500/30 rounded-lg shadow-2xl z-10 min-w-48 animate-scale-in">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => { handleExportCSV(); setExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-600 hover:text-white rounded-md transition-all duration-200"
                >
                  <FiFileText className="text-green-400" />
                  Export as CSV
                </button>
                <button
                  onClick={() => { handleExportJSON(); setExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-600 hover:text-white rounded-md transition-all duration-200"
                >
                  <FiFile className="text-yellow-400" />
                  Export as JSON
                </button>
                <button
                  onClick={() => { handleExportPNG(); setExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-600 hover:text-white rounded-md transition-all duration-200"
                >
                  <FiImage className="text-blue-400" />
                  Export as PNG
                </button>
                <button
                  onClick={() => { handleExportPDF(); setExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-600 hover:text-white rounded-md transition-all duration-200"
                >
                  <FiFileText className="text-red-400" />
                  Export as PDF
                </button>
                <div className="h-px bg-gray-600 my-1"></div>
                <button
                  onClick={() => { handleExportAll(); setExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-600 hover:text-white rounded-md transition-all duration-200 font-semibold"
                >
                  <FiDownload className="text-cyan-400" />
                  Export All Formats
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-md shadow-2xl">
        <p className="text-cyan-300 font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="text-white font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};