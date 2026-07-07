import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  FileCheck,
  LayoutDashboard,
  User,
  Terminal,
  LogOut,
  GraduationCap,
  Unlock,
  Layers,
  ArrowRight
} from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { JobBoard } from "./components/JobBoard";
import { ApplicationsList } from "./components/ApplicationsList";
import { Profile } from "./components/Profile";
import { ApiPlayground } from "./components/ApiPlayground";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("tracker_jwt"));
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  // Authentication screens state
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Session expired.");
      }

      const user = await res.json();
      setCurrentUser(user);
    } catch (err) {
      handleLogout();
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setCheckingSession(false);
    }
  }, [token]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin
      ? { email: authForm.email, password: authForm.password }
      : { name: authForm.name, email: authForm.email, password: authForm.password, role: authForm.role };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      localStorage.setItem("tracker_jwt", data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setAuthSuccess(data.message || "Successfully logged in!");
      setCurrentTab("dashboard");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleQuickLogin = (role: "student" | "admin") => {
    setAuthForm({
      name: "",
      email: role === "admin" ? "admin@tracker.com" : "student@tracker.com",
      password: "password123",
      role: role,
    });
    setIsLogin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("tracker_jwt");
    setToken(null);
    setCurrentUser(null);
    setCurrentTab("dashboard");
    setAuthForm({ name: "", email: "", password: "", role: "student" });
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-xs text-slate-500 mt-2 font-mono">Initializing sessions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* AUTH SCREEN IF NOT LOGGED IN */}
      {!token || !currentUser ? (
        <div className="flex-1 flex flex-col justify-center items-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            
            {/* Logo/Branding */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <GraduationCap size={32} />
              </div>
              <h1 className="font-sans font-extrabold text-2xl tracking-tight text-slate-950">
                Fresher HireTracker
              </h1>
              <p className="text-xs text-slate-500">
                A Job Application Tracking System for young engineers
              </p>
            </div>

            {/* Quick Access Presets (Super helpful for review!) */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Unlock size={14} className="text-amber-500" />
                <span>Quick Access Demo Accounts:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("student")}
                  className="bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 text-slate-700 p-2.5 rounded-xl text-xs font-semibold text-center cursor-pointer transition-all"
                >
                  Student Profile
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin")}
                  className="bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 text-slate-700 p-2.5 rounded-xl text-xs font-semibold text-center cursor-pointer transition-all"
                >
                  Admin Portal
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl text-xs text-center font-medium">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl text-xs text-center font-medium">
                  {authSuccess}
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-1"
                  >
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alice Smith"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-1"
                  >
                    <label className="text-xs font-semibold text-slate-700">Register as</label>
                    <select
                      value={authForm.role}
                      onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                    >
                      <option value="student">Fresher Student</option>
                      <option value="admin">Admin Recruiter</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isLogin ? "Sign In to Dashboard" : "Create Account"}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Register vs Login trigger */}
            <div className="text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setAuthError(null);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
              >
                {isLogin
                  ? "New to Tracker? Create a new account"
                  : "Already registered? Sign in instead"}
              </button>
            </div>

          </div>
        </div>
      ) : (
        
        /* LOGGED-IN MAIN LAYOUT */
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* LEFT SIDEBAR (Sticky on Desktop, top header bar on Mobile) */}
          <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col p-5 gap-6 border-r border-slate-800">
            
            {/* Header branding */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <GraduationCap size={20} />
              </div>
              <div>
                <h2 className="font-sans font-extrabold text-sm tracking-tight leading-none text-white">
                  Fresher Tracking
                </h2>
                <span className="text-[10px] text-slate-400 font-medium">Fullstack Platform</span>
              </div>
            </div>

            {/* Profile Brief panel */}
            <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Logged In As</p>
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] font-medium text-indigo-400 capitalize">{currentUser.role} Account</p>
            </div>

            {/* Nav Menu */}
            <div className="flex-1 flex flex-col gap-1.5">
              <button
                onClick={() => setCurrentTab("dashboard")}
                className={`flex items-center gap-2.5 text-xs font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  currentTab === "dashboard"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <LayoutDashboard size={16} />
                <span>Analytics Stats</span>
              </button>

              <button
                onClick={() => setCurrentTab("jobs")}
                className={`flex items-center gap-2.5 text-xs font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  currentTab === "jobs"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Briefcase size={16} />
                <span>Job Openings</span>
              </button>

              <button
                onClick={() => setCurrentTab("applications")}
                className={`flex items-center gap-2.5 text-xs font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  currentTab === "applications"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <FileCheck size={16} />
                <span>Applications Tracker</span>
              </button>

              {currentUser.role === "student" && (
                <button
                  onClick={() => setCurrentTab("profile")}
                  className={`flex items-center gap-2.5 text-xs font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    currentTab === "profile"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <User size={16} />
                  <span>Resume & Skills</span>
                </button>
              )}

              <button
                onClick={() => setCurrentTab("playground")}
                className={`flex items-center gap-2.5 text-xs font-mono px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  currentTab === "playground"
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Terminal size={15} />
                <span>API Playground</span>
              </button>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-all px-4 py-3 rounded-xl cursor-pointer hover:bg-rose-950/20"
            >
              <LogOut size={16} />
              <span>Sign Out Session</span>
            </button>

          </div>

          {/* MAIN PAGE AREA */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18 }}
              >
                {currentTab === "dashboard" && (
                  <Dashboard
                    authToken={token}
                    role={currentUser.role}
                    onNavigate={(tab) => setCurrentTab(tab)}
                  />
                )}
                
                {currentTab === "jobs" && (
                  <JobBoard
                    authToken={token}
                    role={currentUser.role}
                    onNavigate={(tab) => setCurrentTab(tab)}
                  />
                )}

                {currentTab === "applications" && (
                  <ApplicationsList
                    authToken={token}
                    role={currentUser.role}
                  />
                )}

                {currentTab === "profile" && currentUser.role === "student" && (
                  <Profile authToken={token} />
                )}

                {currentTab === "playground" && (
                  <ApiPlayground authToken={token} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      )}
    </div>
  );
}
