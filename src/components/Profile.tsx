import React, { useState, useEffect } from "react";
import { Upload, FileText, ArrowUp, Briefcase, Calendar, Check, Save } from "lucide-react";

interface ProfileProps {
  authToken: string;
}

export function Profile({ authToken }: ProfileProps) {
  const [profile, setProfile] = useState<any>({
    skills: [],
    bio: "",
    phone: "",
    education: "",
    experience: "",
    resumeName: "",
    resumeUrl: "",
    resumeUploadedAt: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form input bindings
  const [skillsStr, setSkillsStr] = useState("");
  const [bioVal, setBioVal] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [educationVal, setEducationVal] = useState("");
  const [experienceVal, setExperienceVal] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Could not retrieve profile.");
      }

      const data = await res.json();
      const prof = data.profile || {};
      
      setProfile(prof);
      setSkillsStr(Array.isArray(prof.skills) ? prof.skills.join(", ") : "");
      setBioVal(prof.bio || "");
      setPhoneVal(prof.phone || "");
      setEducationVal(prof.education || "");
      setExperienceVal(prof.experience || "");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [authToken]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          skills: skillsStr.split(",").map(s => s.trim()).filter(Boolean),
          bio: bioVal,
          phone: phoneVal,
          education: educationVal,
          experience: experienceVal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile details.");
      }

      setSuccessMsg("Fresher profile information saved successfully!");
      fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/applications/upload-resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload resume file.");
      }

      setSuccessMsg("Resume file uploaded and synchronized successfully!");
      fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Info Form */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-sans font-bold text-lg text-slate-900">Fresher Profile Details</h3>
          <p className="text-xs text-slate-500">Provide skills, background, and achievements to recruiters.</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold">×</button>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold">×</button>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Contact Number</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={phoneVal}
                onChange={(e) => setPhoneVal(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Education Background</label>
              <input
                type="text"
                placeholder="e.g. B.Tech in CSE (Batch of 2026)"
                value={educationVal}
                onChange={(e) => setEducationVal(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Skills (comma-separated list)</label>
            <input
              type="text"
              placeholder="e.g. React, TypeScript, Node.js, Git, Express"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.skills.map((skill: string, i: number) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Academic Internships / Project Summary</label>
            <textarea
              rows={3}
              placeholder="Summarize your academic web apps, hackathons, or minor internships..."
              value={experienceVal}
              onChange={(e) => setExperienceVal(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Professional Bio</label>
            <textarea
              rows={3}
              placeholder="Tell recruiters who you are and what inspires you..."
              value={bioVal}
              onChange={(e) => setBioVal(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? "Saving..." : "Save Profile Info"}</span>
          </button>
        </form>
      </div>

      {/* Resume File Upload Widget */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-sans font-bold text-lg text-slate-900">Upload Fresher Resume</h3>
          <p className="text-xs text-slate-500">Provide an active PDF/Word file for job submissions.</p>
        </div>

        {/* Upload Container Box */}
        <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 flex flex-col items-center justify-center relative hover:bg-slate-100/50 transition-colors">
          <Upload size={32} className={`mb-2 text-slate-400 ${uploading ? "animate-bounce" : ""}`} />
          
          <label className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer block">
            <span>{uploading ? "Uploading file..." : "Click to select and upload resume"}</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              disabled={uploading}
              onChange={handleResumeFileChange}
              className="hidden"
            />
          </label>
          <p className="text-[10px] text-slate-400 mt-1">Accepts PDF, DOC, DOCX up to 5MB limit</p>
        </div>

        {/* Active Resume status */}
        {profile.resumeUrl ? (
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
            <FileText size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 overflow-hidden">
              <p className="font-bold text-emerald-800 truncate">{profile.resumeName}</p>
              <p className="text-slate-500 text-[10px]">
                Uploaded on: {new Date(profile.resumeUploadedAt).toLocaleDateString()}
              </p>
              <div className="pt-1.5">
                <a
                  href={profile.resumeUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[11px] block"
                >
                  Download / View Attached PDF
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800 flex gap-2">
            <span>No active resume attached. Upload your resume file above to be able to apply for jobs successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}
