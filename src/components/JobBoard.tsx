import React, { useEffect, useState } from "react";
import { Search, MapPin, Briefcase, DollarSign, PlusCircle, Trash2, Edit3, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Job } from "../types";

interface JobBoardProps {
  authToken: string;
  role: string;
  onNavigate: (tab: string) => void;
}

export function JobBoard({ authToken, role, onNavigate }: JobBoardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "Full-time",
    experienceLevel: "Fresher",
    salaryRange: "",
    description: "",
    requirements: "",
    externalApplyUrl: "",
  });
  const [applyNotes, setApplyNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const queryParams = new URLSearchParams({
        search,
        jobType,
        experienceLevel,
        location,
        page: String(page),
        limit: "5" // 5 items per page for better UI presentation
      });

      const res = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load jobs list.");
      }
      const data = await res.json();
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, jobType, experienceLevel, location, page]);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements.split(",").map(r => r.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to post job.");
      }

      setSuccessMsg(data.message);
      setShowAddModal(false);
      // Reset form
      setFormData({
        title: "",
        company: "",
        location: "",
        jobType: "Full-time",
        experienceLevel: "Fresher",
        salaryRange: "",
        description: "",
        requirements: "",
        externalApplyUrl: "",
      });
      fetchJobs();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements.split(",").map(r => r.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update job.");
      }

      setSuccessMsg(data.message);
      setShowEditModal(false);
      setSelectedJob(null);
      fetchJobs();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this job and all its applications?")) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete job.");
      }

      setSuccessMsg(data.message);
      fetchJobs();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleApplyToJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const redirectUrl = selectedJob.externalApplyUrl || `https://www.google.com/search?q=${encodeURIComponent(selectedJob.company + " " + selectedJob.title + " careers")}`;

    // Open a blank window immediately under user interaction so browser doesn't block it
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Redirecting...</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                color: #1e293b;
                text-align: center;
              }
              .spinner {
                border: 4px solid #e2e8f0;
                border-top: 4px solid #4f46e5;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              h2 { font-size: 20px; margin-bottom: 8px; font-weight: 600; }
              p { color: #64748b; font-size: 14px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="spinner"></div>
            <h2>Applying for ${selectedJob.title}</h2>
            <p>Submitting your profile to our tracker and redirecting you to ${selectedJob.company}...</p>
          </body>
        </html>
      `);
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          notes: applyNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (newWindow) newWindow.close();
        throw new Error(data.message || "Failed to apply.");
      }

      setSuccessMsg(`${data.message} Redirecting you to ${selectedJob.company}'s official application page...`);
      setShowApplyModal(false);
      setApplyNotes("");
      
      // Update the opened window's location
      if (newWindow) {
        newWindow.location.href = redirectUrl;
      } else {
        // Fallback: If popup was blocked entirely, redirect the main window
        window.location.href = redirectUrl;
      }
      
      // Auto redirect to Applications list
      setTimeout(() => {
        onNavigate("applications");
        setSelectedJob(null);
      }, 1500);
    } catch (err: any) {
      if (newWindow) newWindow.close();
      setErrorMsg(err.message);
    }
  };

  const openEditModal = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      salaryRange: job.salaryRange,
      description: job.description,
      requirements: job.requirements.join(", "),
      externalApplyUrl: job.externalApplyUrl || "",
    });
    setShowEditModal(true);
  };

  const openApplyModal = (job: Job) => {
    setSelectedJob(job);
    setApplyNotes("");
    setShowApplyModal(true);
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

      {/* Header Board Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div>
          <h2 className="font-sans font-bold text-xl text-slate-900">Job Opportunities</h2>
          <p className="text-xs text-slate-500">Discover and apply for entry-level fresher roles.</p>
        </div>
        
        {role === "admin" && (
          <button
            onClick={() => {
              setFormData({
                title: "",
                company: "",
                location: "",
                jobType: "Full-time",
                experienceLevel: "Fresher",
                salaryRange: "",
                description: "",
                requirements: "",
                externalApplyUrl: "",
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer self-start"
          >
            <PlusCircle size={16} />
            <span>Post Job Vacancy</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search role or company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full text-xs pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={jobType}
            onChange={(e) => { setJobType(e.target.value); setPage(1); }}
            className="w-full text-xs px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div>
          <select
            value={experienceLevel}
            onChange={(e) => { setExperienceLevel(e.target.value); setPage(1); }}
            className="w-full text-xs px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="">All Experience Levels</option>
            <option value="Fresher">Fresher (Only)</option>
            <option value="0-1 years">0-1 Years</option>
            <option value="1-2 years">1-2 Years</option>
            <option value="3+ years">3+ Years</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Filter by location (e.g. Remote)..."
            value={location}
            onChange={(e) => { setLocation(e.target.value); setPage(1); }}
            className="w-full text-xs px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Jobs Feed */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white text-slate-500">
          <Briefcase size={36} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold">No vacancies found matching your filters.</p>
          <button
            onClick={() => { setSearch(""); setJobType(""); setExperienceLevel(""); setLocation(""); }}
            className="text-xs text-indigo-600 underline mt-1"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const dateStr = new Date(job.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });

            return (
              <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-sans font-bold text-base text-slate-900">{job.title}</h3>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md">
                        {job.jobType}
                      </span>
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
                        {job.experienceLevel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">{job.company}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {role === "admin" ? (
                      <>
                        <button
                          onClick={() => openEditModal(job)}
                          className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer"
                          title="Edit Job"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openApplyModal(job)}
                        className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={13} />
                    {job.salaryRange}
                  </span>
                  <span className="ml-auto text-[11px] text-slate-400">
                    Posted on {dateStr}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {job.description}
                  </p>
                  {job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requirements.map((req, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-2">
              <span className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================= */}
      {/* MODALS */}
      {/* ======================================= */}

      {/* Add / Edit Job Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            <h3 className="font-sans font-bold text-lg text-slate-950">
              {showAddModal ? "Post a New Job Vacancy" : "Edit Job Vacancy"}
            </h3>

            <form onSubmit={showAddModal ? handleAddJob : handleUpdateJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Role/Title*</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Company*</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Job Type*</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Experience Required*</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Fresher">Fresher (Only)</option>
                    <option value="0-1 years">0-1 Years</option>
                    <option value="1-2 years">1-2 Years</option>
                    <option value="3+ years">3+ Years</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Location*</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    placeholder="e.g. Pune, India (Hybrid)"
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Salary Range</label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    placeholder="e.g. ₹5 - 7 Lakhs / year"
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Job Description*</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Requirements (comma-separated)</label>
                <input
                  type="text"
                  value={formData.requirements}
                  placeholder="e.g. ReactJS, Redux, TailwindCSS, REST APIs"
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Company Career / Application Page URL (Optional)</label>
                <input
                  type="url"
                  value={formData.externalApplyUrl}
                  placeholder="e.g. https://google.com/careers (Will redirect students after applying)"
                  onChange={(e) => setFormData({ ...formData, externalApplyUrl: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedJob(null); }}
                  className="text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl cursor-pointer"
                >
                  {showAddModal ? "Post Vacancy" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-950">Review & Apply</h3>
                <p className="text-xs text-slate-500">
                  Submit to your tracker and auto-redirect to official careers portal.
                </p>
              </div>
              <button
                onClick={() => { setShowApplyModal(false); setSelectedJob(null); }}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Left Column: Job Details */}
              <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6 max-h-[55vh] overflow-y-auto">
                <div>
                  <h4 className="font-sans font-bold text-base text-slate-900">{selectedJob.title}</h4>
                  <p className="text-xs font-semibold text-indigo-600">{selectedJob.company}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="font-semibold block text-slate-400">LOCATION</span>
                    <span className="flex items-center gap-1 text-slate-700 mt-0.5">
                      <MapPin size={11} className="text-slate-500" />
                      {selectedJob.location}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-400">SALARY RANGE</span>
                    <span className="flex items-center gap-1 text-slate-700 mt-0.5">
                      <DollarSign size={11} className="text-slate-500" />
                      {selectedJob.salaryRange}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="font-semibold block text-slate-400">JOB TYPE</span>
                    <span className="inline-block bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-sm mt-0.5 text-[10px]">
                      {selectedJob.jobType}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="font-semibold block text-slate-400">EXPERIENCE</span>
                    <span className="inline-block bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-sm mt-0.5 text-[10px]">
                      {selectedJob.experienceLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 block">Job Description</span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">Job Requirements</span>
                    <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                      {selectedJob.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: Application Form & Action */}
              <div className="flex flex-col justify-between space-y-4">
                <form onSubmit={handleApplyToJob} className="space-y-4 flex-1">
                  {/* Resume Info */}
                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
                    <p className="font-semibold text-amber-950 flex items-center gap-1">
                      📎 Profile Resume Selected
                    </p>
                    <p>
                      Our tracker automatically includes your uploaded PDF/Word resume from your profile. Please make sure it is updated.
                    </p>
                  </div>

                  {/* Redirection Info */}
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl p-3 text-[11px] space-y-1">
                    <p className="font-bold text-indigo-950 flex items-center gap-1">
                      <ExternalLink size={12} /> Direct Company Redirection
                    </p>
                    <p>
                      <strong>How it works:</strong> Submitting this form instantly logs this job in your tracking dashboard. Then, we will automatically redirect you to <strong>{selectedJob.company}&apos;s</strong> careers page so you can finalize your direct application to them!
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex justify-between items-center">
                      <span>Cover Letter / Pitch (Optional)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Saves to your tracker</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Hi! I have experience with React and Node.js. I would love to discuss this fresher opportunity..."
                      value={applyNotes}
                      onChange={(e) => setApplyNotes(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setShowApplyModal(false); setSelectedJob(null); }}
                      className="text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Apply & Redirect</span>
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
