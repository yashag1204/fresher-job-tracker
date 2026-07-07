import React, { useEffect, useState } from "react";
import { FileText, Calendar, Edit3, Trash2, ShieldAlert, Check, X, Clock, HelpCircle, UserCheck } from "lucide-react";
import { Application } from "../types";

interface ApplicationsListProps {
  authToken: string;
  role: string;
}

export function ApplicationsList({ authToken, role }: ApplicationsListProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status adjustment form states
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [statusVal, setStatusVal] = useState("");
  const [feedbackVal, setFeedbackVal] = useState("");
  const [interviewDateVal, setInterviewDateVal] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/applications", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Could not retrieve application submissions.");
      }

      const data = await res.json();
      setApplications(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [authToken]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/applications/${editingApp.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: statusVal,
          feedback: feedbackVal,
          interviewDate: interviewDateVal || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not update status.");
      }

      setSuccessMsg("Application status updated successfully!");
      setEditingApp(null);
      fetchApplications();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleWithdrawApplication = async (id: string) => {
    const confirmationWord = role === "admin" ? "delete" : "withdraw";
    if (!window.confirm(`Are you sure you want to ${confirmationWord} this job application?`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process withdraw action.");
      }

      setSuccessMsg(`Application successfully ${confirmationWord}n.`);
      fetchApplications();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const openStatusModal = (app: any) => {
    setEditingApp(app);
    setStatusVal(app.status);
    setFeedbackVal(app.feedback || "");
    
    if (app.interviewDate) {
      // format to datetime-local friendly format
      const date = new Date(app.interviewDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setInterviewDateVal(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setInterviewDateVal("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold hover:text-rose-950">×</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold hover:text-emerald-950">×</button>
        </div>
      )}

      <div>
        <h2 className="font-sans font-bold text-xl text-slate-900">
          {role === "admin" ? "Applicant Screen Board" : "Your Applications"}
        </h2>
        <p className="text-xs text-slate-500">
          {role === "admin"
            ? "Monitor, review resume files, schedule interviews, and provide feedback for candidates."
            : "Review progress, feedback updates, and schedule details for your applications."}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white text-slate-500">
          <FileText size={36} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold">No applications found.</p>
          <p className="text-xs text-slate-400 mt-1">
            {role === "admin"
              ? "Students have not submitted applications yet."
              : "Explore the Job Board to apply for positions!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const dateStr = new Date(app.appliedDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });

            const statusStyles: Record<string, string> = {
              Applied: "bg-indigo-50 text-indigo-700 border-indigo-150",
              Screening: "bg-cyan-50 text-cyan-700 border-cyan-150",
              Interview: "bg-amber-50 text-amber-700 border-amber-150",
              Offer: "bg-emerald-50 text-emerald-700 border-emerald-150",
              Rejected: "bg-rose-50 text-rose-700 border-rose-150",
            };

            return (
              <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-sans font-bold text-base text-slate-900">
                        {app.jobDetails?.title || "Role Unavailable"}
                      </h3>
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${statusStyles[app.status] || "bg-slate-100"}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {app.jobDetails?.company || "Company Details Unavailable"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {role === "admin" ? (
                      <button
                        onClick={() => openStatusModal(app)}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Edit3 size={14} />
                        <span>Review & Route Stage</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleWithdrawApplication(app.id)}
                        className="flex items-center gap-1 text-xs font-semibold border border-rose-200 hover:bg-rose-50 text-rose-600 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Submission Meta</p>
                    <p>Applied Date: <strong className="text-slate-800">{dateStr}</strong></p>
                    {app.notes && (
                      <p className="mt-1">
                        Candidate Note: <span className="italic text-slate-600">&quot;{app.notes}&quot;</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Applicant Details</p>
                    {app.applicantDetails ? (
                      <>
                        <p>Name: <strong className="text-slate-800">{app.applicantDetails.name}</strong></p>
                        <p>Email: <span className="text-slate-600">{app.applicantDetails.email}</span></p>
                        {app.applicantDetails.profile?.phone && (
                          <p>Phone: <span className="text-slate-600">{app.applicantDetails.profile.phone}</span></p>
                        )}
                        {app.applicantDetails.profile?.education && (
                          <p>Edu: <span className="text-slate-600 truncate">{app.applicantDetails.profile.education}</span></p>
                        )}
                      </>
                    ) : (
                      <p className="italic text-slate-400">Anonymous applicant details</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Attached Resume File</p>
                    {app.resumeUrl ? (
                      <a
                        href={app.resumeUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold underline"
                      >
                        <FileText size={14} />
                        <span className="truncate max-w-[150px]">{app.resumeName || "view_resume_file.pdf"}</span>
                      </a>
                    ) : (
                      <p className="text-slate-400 italic">No resume attached</p>
                    )}
                    {app.applicantDetails?.profile?.skills && app.applicantDetails.profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {app.applicantDetails.profile.skills.slice(0, 3).map((skill: string, i: number) => (
                          <span key={i} className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Interview / Feedback updates if present */}
                {(app.interviewDate || app.feedback) && (
                  <div className="border-t border-slate-100 pt-3 flex flex-col md:flex-row gap-4 text-xs">
                    {app.interviewDate && (
                      <div className="flex items-center gap-2 text-amber-800 bg-amber-50/50 border border-amber-100 px-3 py-2 rounded-xl">
                        <Calendar size={15} className="text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold">Technical Interview Scheduled</p>
                          <p>
                            {new Date(app.interviewDate).toLocaleString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {app.feedback && (
                      <div className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                        <p className="font-bold text-slate-800 mb-0.5">Recruiter Feedback/Remarks</p>
                        <p className="text-slate-600 leading-relaxed italic">&quot;{app.feedback}&quot;</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================= */}
      {/* ADMIN STATUS EDIT MODAL */}
      {/* ======================================= */}
      {editingApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="font-sans font-bold text-lg text-slate-950">Review Application</h3>
              <p className="text-xs text-slate-500 mt-1">
                Candidate: <strong className="text-slate-800">{editingApp.applicantDetails?.name || "John"}</strong>
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Pipeline Stage Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                >
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening / Review</option>
                  <option value="Interview">Technical Interview</option>
                  <option value="Offer">Hired / Job Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Interview Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={interviewDateVal}
                  onChange={(e) => setInterviewDateVal(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Recruiter Notes / Feedback</label>
                <textarea
                  rows={4}
                  placeholder="Enter remarks, feedback, or meeting invites..."
                  value={feedbackVal}
                  onChange={(e) => setFeedbackVal(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl cursor-pointer"
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
