import React, { useEffect, useState } from "react";
import { Briefcase, FileCheck, Layers, Award, Clock, ArrowUpRight, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DashboardStats } from "../types";

interface DashboardProps {
  authToken: string;
  role: string;
  onNavigate: (tab: string) => void;
}

export function Dashboard({ authToken, role, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Could not fetch analytics.");
      }

      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [authToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center gap-2">
        <span>Could not load stats: {error}</span>
        <button onClick={fetchStats} className="underline ml-auto hover:text-rose-950 font-medium">Retry</button>
      </div>
    );
  }

  // Formatting application pipeline data for Recharts
  const pipelineData = [
    { name: "Applied", value: stats.applicationsByStatus.applied, color: "#4f46e5" }, // Indigo
    { name: "Screening", value: stats.applicationsByStatus.screening, color: "#06b6d4" }, // Cyan
    { name: "Interview", value: stats.applicationsByStatus.interview, color: "#f59e0b" }, // Amber
    { name: "Offer", value: stats.applicationsByStatus.offer, color: "#10b981" }, // Emerald
    { name: "Rejected", value: stats.applicationsByStatus.rejected, color: "#ef4444" }, // Red
  ];

  const totalAppCount = stats.totalApplications;
  const offerCount = stats.applicationsByStatus.offer;
  const interviewCount = stats.applicationsByStatus.interview;
  const successRate = totalAppCount > 0 ? Math.round(((offerCount + interviewCount) / totalAppCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
            Role: {role === "admin" ? "Recruiter Administrator" : "Fresher Candidate"}
          </span>
          <h2 className="font-sans font-bold text-2xl tracking-tight">
            {role === "admin"
              ? "Platform Command Center"
              : "Kickstart Your Technical Career"}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {role === "admin"
              ? "Analyze fresher applicants, review job vacancy analytics, schedule technical interviews, and update hire stages in one central interface."
              : "Track all your submitted applications, customize your fresher profile details, upload your PDF resume, and monitor interview schedules."}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-slate-800/50 to-transparent pointer-events-none hidden md:block"></div>
      </div>

      {/* Grid of Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {role === "admin" ? "All Jobs Listed" : "Available Positions"}
            </span>
            <p className="text-2xl font-bold text-slate-900">{stats.totalJobs}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {role === "admin" ? "Total Candidate Apps" : "Your Submitted Apps"}
            </span>
            <p className="text-2xl font-bold text-slate-900">{stats.totalApplications}</p>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <FileCheck size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Interviews Scheduled
            </span>
            <p className="text-2xl font-bold text-slate-900">{stats.applicationsByStatus.interview}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {role === "admin" ? "Active Hire Rate" : "Progression Score"}
            </span>
            <p className="text-2xl font-bold text-slate-900">
              {role === "admin" ? `${stats.adminSummary?.totalStudents || 0} Students` : `${successRate}%`}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            {role === "admin" ? <Layers size={22} /> : <TrendingUp size={22} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-sans font-semibold text-slate-900">Application Pipeline Stages</h3>
              <p className="text-xs text-slate-400">Total volume distribution across stages</p>
            </div>
            <span className="text-xs font-semibold bg-slate-50 text-slate-600 px-2 py-1 rounded-md">
              Real-time Sync
            </span>
          </div>

          <div className="h-64 w-full">
            {totalAppCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <Layers size={36} className="mb-2 text-slate-300" />
                <span>No application pipeline details to plot.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                    cursor={{ fill: "rgba(226, 232, 240, 0.4)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick info / Categories */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
          <h3 className="font-sans font-semibold text-slate-900 mb-3">Job Type Mix</h3>
          <p className="text-xs text-slate-400 mb-4">Breakdown of current listed roles</p>

          <div className="space-y-3.5 flex-1 justify-center flex flex-col">
            {Object.entries(stats.jobsByType).map(([type, count]: [string, any]) => {
              const percentages = stats.totalJobs > 0 ? Math.round((count / stats.totalJobs) * 100) : 0;
              const typeColors: Record<string, string> = {
                "Full-time": "bg-indigo-600",
                "Part-time": "bg-cyan-600",
                "Internship": "bg-amber-500",
                "Contract": "bg-rose-500",
              };

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${typeColors[type] || "bg-slate-400"}`}></span>
                      {type}
                    </span>
                    <span>{count} ({percentages}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${typeColors[type] || "bg-slate-400"} rounded-full`} style={{ width: `${percentages}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Applications Activity */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-sans font-semibold text-slate-900">Recent Tracking Logs</h3>
            <p className="text-xs text-slate-400">Latest updates and progress</p>
          </div>
          <button
            onClick={() => onNavigate(role === "admin" ? "applications" : "jobs")}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>{role === "admin" ? "Manage Applications" : "Browse More Jobs"}</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {stats.recentApplications.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
            No application activities found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                  <th className="py-2">Role & Company</th>
                  {role === "admin" && <th className="py-2">Candidate</th>}
                  <th className="py-2">Applied Date</th>
                  <th className="py-2">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                {stats.recentApplications.map((app: any) => {
                  const statusStyles: Record<string, string> = {
                    Applied: "bg-indigo-50 text-indigo-700 border-indigo-200",
                    Screening: "bg-cyan-50 text-cyan-700 border-cyan-200",
                    Interview: "bg-amber-50 text-amber-700 border-amber-200",
                    Offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    Rejected: "bg-rose-50 text-rose-700 border-rose-200",
                  };

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-3">
                        <div>
                          <div className="font-semibold text-slate-900">{app.jobTitle}</div>
                          <div className="text-xs text-slate-400">{app.company}</div>
                        </div>
                      </td>
                      {role === "admin" && (
                        <td className="py-3 text-xs text-slate-600 font-medium">{app.applicantName}</td>
                      )}
                      <td className="py-3 text-xs text-slate-500">
                        {new Date(app.appliedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <span className={`text-[11px] font-semibold border px-2 py-0.5 rounded-full ${statusStyles[app.status] || "bg-slate-100"}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
