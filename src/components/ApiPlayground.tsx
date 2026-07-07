import React, { useState } from "react";
import { Play, ArrowRight, CheckCircle, AlertCircle, Copy, Check } from "lucide-react";

interface Endpoint {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  requiresAuth: boolean;
  role: string;
  bodyTemplate?: any;
}

const ENDPOINTS: Endpoint[] = [
  {
    name: "User Registration",
    method: "POST",
    path: "/api/auth/register",
    description: "Register a new student or admin user.",
    requiresAuth: false,
    role: "Public",
    bodyTemplate: {
      name: "Alice Fresher",
      email: "alice@example.com",
      password: "password123",
      role: "student"
    }
  },
  {
    name: "User Login",
    method: "POST",
    path: "/api/auth/login",
    description: "Authenticate email/password and obtain JWT token.",
    requiresAuth: false,
    role: "Public",
    bodyTemplate: {
      email: "student@tracker.com",
      password: "password123"
    }
  },
  {
    name: "Fetch Current User profile",
    method: "GET",
    path: "/api/auth/me",
    description: "Fetch logged-in user profile utilizing the Bearer token.",
    requiresAuth: true,
    role: "Authenticated"
  },
  {
    name: "Update Student Profile",
    method: "PUT",
    path: "/api/auth/profile",
    description: "Update student profile details, education, skills, and bio.",
    requiresAuth: true,
    role: "Student Only",
    bodyTemplate: {
      skills: ["React", "TypeScript", "Node.js", "Docker"],
      bio: "Active developer fresher, graduating in 2026.",
      phone: "+91 98765 43210",
      education: "BS Computer Science",
      experience: "Completed 1 backend development internship"
    }
  },
  {
    name: "Get All Job Vacancies",
    method: "GET",
    path: "/api/jobs?search=&jobType=&experienceLevel=&page=1&limit=10",
    description: "List job posts with multi-parameter search, filters, and pagination.",
    requiresAuth: false,
    role: "Public"
  },
  {
    name: "Create Job Vacancy",
    method: "POST",
    path: "/api/jobs",
    description: "Post a new job opening (Admin only).",
    requiresAuth: true,
    role: "Admin Only",
    bodyTemplate: {
      title: "Junior Fullstack Engineer",
      company: "TCS",
      location: "Mumbai, India (Hybrid)",
      jobType: "Full-time",
      experienceLevel: "Fresher",
      salaryRange: "₹4,50,000 / annum",
      description: "We are hiring freshers to join our high-performing digital transformation projects. You will learn cloud native development.",
      requirements: "Basic JavaScript, Problem solving mindset, SQL basics"
    }
  },
  {
    name: "Submit Job Application",
    method: "POST",
    path: "/api/applications",
    description: "Submit resume and application to an active job.",
    requiresAuth: true,
    role: "Student Only",
    bodyTemplate: {
      jobId: "job-1",
      notes: "I am extremely passionate about backend engineering. Please review my profile."
    }
  },
  {
    name: "Get Applications List",
    method: "GET",
    path: "/api/applications",
    description: "Get lists of applications (Admins see all; Students see only theirs).",
    requiresAuth: true,
    role: "Authenticated"
  },
  {
    name: "Update Application Stage",
    method: "PUT",
    path: "/api/applications/app-1",
    description: "Update status, schedule interview date, and provide admin feedback.",
    requiresAuth: true,
    role: "Admin / Student (restricted)",
    bodyTemplate: {
      status: "Interview",
      interviewDate: "2026-07-15T10:00:00.000Z",
      feedback: "Great resume alignment! Invited for technical round."
    }
  },
  {
    name: "Dashboard Analytics",
    method: "GET",
    path: "/api/dashboard/stats",
    description: "Retrieve metrics, status pipelines, and recent updates.",
    requiresAuth: true,
    role: "Authenticated"
  }
];

export function ApiPlayground({ authToken }: { authToken: string | null }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(ENDPOINTS[0].bodyTemplate || {}, null, 2)
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responsePayload, setResponsePayload] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectEndpoint = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(JSON.stringify(endpoint.bodyTemplate || {}, null, 2));
    setResponseStatus(null);
    setResponsePayload(null);
  };

  const handleCopyCurl = () => {
    const url = window.location.origin + selectedEndpoint.path;
    let curl = `curl -X ${selectedEndpoint.method} "${url}" \\\n`;
    curl += `  -H "Content-Type: application/json" \\\n`;
    if (selectedEndpoint.requiresAuth && authToken) {
      curl += `  -H "Authorization: Bearer ${authToken}" \\\n`;
    }
    if (selectedEndpoint.bodyTemplate) {
      curl += `  -d '${requestBody.replace(/'/g, "'\\''")}'`;
    }
    navigator.clipboard.writeText(curl.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeApiCall = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponsePayload(null);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (selectedEndpoint.requiresAuth && authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const options: RequestInit = {
      method: selectedEndpoint.method,
      headers,
    };

    if (selectedEndpoint.method !== "GET" && selectedEndpoint.method !== "DELETE") {
      try {
        options.body = JSON.stringify(JSON.parse(requestBody));
      } catch (err) {
        setResponseStatus(400);
        setResponsePayload({ message: "Invalid JSON format in Request Body field." });
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(selectedEndpoint.path, options);
      setResponseStatus(response.status);
      const json = await response.json();
      setResponsePayload(json);
    } catch (error: any) {
      setResponseStatus(500);
      setResponsePayload({ message: "Network connection or server error.", error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Endpoints List */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <h3 className="font-sans font-semibold text-lg text-slate-900 mb-3">API Routes</h3>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Select any endpoint below to view specifications, request parameters, or test them against the backend live.
        </p>
        <div className="space-y-2 overflow-y-auto max-h-[550px] pr-1">
          {ENDPOINTS.map((endpoint) => {
            const isSelected = selectedEndpoint.name === endpoint.name;
            const methodColors = {
              GET: "bg-emerald-50 text-emerald-700 border-emerald-200",
              POST: "bg-blue-50 text-blue-700 border-blue-200",
              PUT: "bg-amber-50 text-amber-700 border-amber-200",
              DELETE: "bg-rose-50 text-rose-700 border-rose-200",
            };

            return (
              <button
                key={endpoint.name}
                onClick={() => handleSelectEndpoint(endpoint)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? "bg-slate-50 border-slate-900 shadow-xs"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm border ${
                      methodColors[endpoint.method]
                    }`}
                  >
                    {endpoint.method}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-600 truncate max-w-[150px]">
                    {endpoint.path.split("?")[0]}
                  </span>
                </div>
                <div className="text-xs font-sans font-medium text-slate-900 truncate">
                  {endpoint.name}
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span>Role: {endpoint.role}</span>
                  {endpoint.requiresAuth && (
                    <span className="text-amber-600 font-medium">JWT Header Req.</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor & Executor */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                    selectedEndpoint.method === "GET"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : selectedEndpoint.method === "POST"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : selectedEndpoint.method === "PUT"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="text-sm font-mono text-slate-700 select-all font-semibold">
                  {selectedEndpoint.path}
                </span>
              </div>
              <h4 className="font-sans font-semibold text-slate-950 mt-2">
                {selectedEndpoint.name}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{selectedEndpoint.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCurl}
                className="flex items-center gap-1 text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy cURL"}</span>
              </button>
              <button
                onClick={executeApiCall}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Play size={14} fill="currentColor" />
                <span>{isLoading ? "Running..." : "Send Request"}</span>
              </button>
            </div>
          </div>

          {/* Request Body Editor (Only if not GET/DELETE) */}
          {selectedEndpoint.method !== "GET" && selectedEndpoint.method !== "DELETE" && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Request Body (JSON)
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={6}
                className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          )}

          {/* Authorization context notice */}
          {selectedEndpoint.requiresAuth && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50/50 border border-amber-100 text-[11px] text-amber-800">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <span>
                {authToken
                  ? "✓ Authorized context: Session token is automatically injected."
                  : "⚠ Anonymous context: Token not found. Please log in first to test this endpoint successfully."}
              </span>
            </div>
          )}
        </div>

        {/* Response Viewer */}
        {(responseStatus !== null || isLoading) && (
          <div className="bg-slate-950 text-slate-50 rounded-2xl p-5 shadow-lg border border-slate-900 font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-slate-400 font-sans font-semibold">Response Payload</span>
              {isLoading ? (
                <span className="text-blue-400 animate-pulse font-sans">Connecting...</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-sans">Status:</span>
                  <span
                    className={`font-bold font-sans px-2 py-0.5 rounded-sm ${
                      responseStatus && responseStatus >= 200 && responseStatus < 300
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                        : "bg-rose-950/80 text-rose-400 border border-rose-800"
                    }`}
                  >
                    {responseStatus}
                  </span>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="h-28 flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            ) : (
              <pre className="overflow-x-auto max-h-[300px] leading-relaxed select-all">
                {JSON.stringify(responsePayload, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
