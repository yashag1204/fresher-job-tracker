# 🚀 Job Application Tracker for Freshers

A high-fidelity, production-ready, full-stack application designed specifically for freshers and students to discover new job opportunities, prepare customized applications with localized tracking, upload resumes, and seamlessly apply.

The application automatically logs all student actions in a central tracking database, then bypasses browser popup blockers using a custom transition-loading engine to redirect the applicant directly to the official company careers portal.

---

## 🗺️ Project Roadmap & Milestone Tracker

### Phase 1: Foundations & Architecture (Completed ✅)
*   **Authentication & Access Control**: Full JWT-based signup and login system separating Student (fresher) roles and Admin (moderator/recruiter) roles.
*   **Database & Seed Engine**: Structured multi-model local data schemas for Users, Jobs, and Applications with realistic initial fresher opportunities (e.g., Google, Tech Mahindra, Cognizant).
*   **File Upload Pipeline**: Robust, secure server-side resume management with multi-mimetype validation (PDF, DOC, DOCX) and drag-and-drop client uploads.

### Phase 2: Core Job Searching & Applications (Completed ✅)
*   **Advanced Filtering Engine**: Real-time multi-dimensional searching for job titles, companies, locations (including Remote), job types (Full-time, Internship), and experience levels.
*   **Dynamic Two-Column Action Panel**: Split review experience for candidate comfort. On click, lists show detailed descriptions and guidelines on the left, with personalized tracking cover letters on the right.
*   **Direct Company Redirection (Zero-Popup-Blocker Engine)**: Secure transitional popup framework that opens immediately upon user request and updates location dynamically after successful API registration, ensuring seamless redirection.

### Phase 3: Analytics & Smart Features (Planned ⏳)
*   **AI Resume Analyzer**: Integrate Google Gemini API model to cross-reference uploaded resume contents against selected job descriptions and suggest real-time modifications.
*   **Automated Email Reminders**: Cron-scheduled reminders prompting applicants to follow up with companies 7 and 14 days after their initial application.
*   **Visual Application Funnel**: Recharts-based interactive kanban pipeline for students to visually slide applications from "Applied" -> "Interviewing" -> "Offered" -> "Rejected".

---

## 🛠️ Architecture & Tech Stack

```text
├── server.ts                  # High-performance Express-Vite backend
├── src/
│   ├── main.tsx              # Single-Page Application (SPA) entry point
│   ├── App.tsx               # Main application component & core router
│   ├── types.ts              # Global type definitions & schemas
│   ├── components/           # UI Views (JobBoard, Dashboard, Profile, Auth)
│   ├── controllers/          # Express route handler logic & operations
│   ├── db/                   # Persistent database controller & seed data
│   ├── middleware/           # JWT security guards & Multer file handlers
│   └── routes/               # Express REST endpoint maps
```

*   **Frontend**: React (Vite-powered), Tailwind CSS, Lucide Icons, and Framer Motion layout animations.
*   **Backend**: Node.js, Express, TSX, CJS-esbuild production bundler.
*   **Database**: Structured in-memory local state engine with disk persistence capabilities.

---

## 🏃 Getting Started & Local Setup

### 📋 Prerequisites
*   Node.js (v18 or higher recommended)
*   NPM (v9 or higher)

### 1. Environment Configuration
Create a `.env` file in the **project root directory** (the same location as `package.json`). Do not place it in `src/`.

Configure your `.env` variables as shown below:
```env
# Server Configuration
PORT=3000

# Security Secrets (Do NOT share publicly)
JWT_SECRET=your_super_secure_sha256_or_custom_jwt_key

# Database Connection (Optional fallback)
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/jobtracker
```

### 2. Dependency Installation
Install all base requirements defined in `package.json` by running:
```bash
npm install
```

### 3. Launching Development Server
Start the full-stack container running Express with hot Vite asset middleware:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Compiling Production Build
Compile and bundle both the client and server assets inside the `dist/` folder:
```bash
npm run build
```

### 5. Running Production Server
Boot the production-optimized bundled CommonJS server:
```bash
npm start
```

---

## 🛡️ Security & Best Practices
1.  **Do Not Expose Secrets**: Never commit `.env` or check confidential passwords/secret keys into GitHub or shared code environments.
2.  **API Key Safety**: Any integration of third-party SDKs (such as Gemini, Stripe, or Database credentials) is strictly handled server-side within Express API routes `/api/*` to ensure keys remain hidden from client browsers.
