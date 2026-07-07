import fs from "fs/promises";
import path from "path";
import { User, Job, Application } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");

// Initial mock data to ensure the platform shows rich contents on first load
const INITIAL_USERS: User[] = [
  {
    id: "admin-1",
    name: "Yash Agrawal (Admin)",
    email: "admin@tracker.com",
    passwordHash: "$2a$10$7R6v7Y2g665YgWzD64B5feZ/34v3vHnSDeWb91.5tO.6bV6v67vL.", // password: "password123"
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "student-1",
    name: "John Doe (Fresher)",
    email: "student@tracker.com",
    passwordHash: "$2a$10$7R6v7Y2g665YgWzD64B5feZ/34v3vHnSDeWb91.5tO.6bV6v67vL.", // password: "password123"
    role: "student",
    profile: {
      skills: ["React", "TypeScript", "Node.js", "Tailwind CSS"],
      bio: "Aspiring Full Stack Developer looking for fresher roles.",
      phone: "+1234567890",
      education: "B.Tech in Computer Science, 2026",
      experience: "Completed 2 academic web development projects.",
      resumeName: "john_doe_resume.pdf",
      resumeUrl: "/uploads/mock-resume.pdf",
      resumeUploadedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const INITIAL_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Software Engineer Intern",
    company: "Google India",
    location: "Bengaluru, India (On-site)",
    jobType: "Internship",
    experienceLevel: "Fresher",
    salaryRange: "₹50,000 - ₹80,000 / month",
    description: "Join our Engineering team as an Intern to solve real-world problems. You will work alongside senior developers on core cloud infrastructure.",
    requirements: ["Proficiency in Java, C++ or Python", "Basic understanding of data structures and algorithms", "Good communication skills"],
    status: "Active",
    externalApplyUrl: "https://www.google.com/about/careers/applications/",
    createdBy: "admin-1",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-2",
    title: "Associate React Developer",
    company: "Tech Mahindra",
    location: "Remote (India)",
    jobType: "Full-time",
    experienceLevel: "Fresher",
    salaryRange: "₹4,0,000 - ₹6,0,000 / annum",
    description: "We are seeking a Junior Frontend Developer proficient in React and modern CSS. You will build user-facing features for international clients.",
    requirements: ["Hands-on with HTML, CSS, React, JavaScript", "Familiarity with Git/GitHub", "Eagerness to learn and collaborate"],
    status: "Active",
    externalApplyUrl: "https://www.techmahindra.com/en-in/careers/",
    createdBy: "admin-1",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-3",
    title: "Backend Developer (NodeJS)",
    company: "Cognizant",
    location: "Pune, India (Hybrid)",
    jobType: "Full-time",
    experienceLevel: "0-1 years",
    salaryRange: "₹5,00,000 - ₹7,00,000 / annum",
    description: "Develop, maintain and scale high-performance backend APIs. You will work on database schema design, security implementation, and performance fine-tuning.",
    requirements: ["Strong knowledge of Node.js and Express", "Basic knowledge of SQL/NoSQL databases", "Understanding of RESTful API design"],
    status: "Active",
    externalApplyUrl: "https://careers.cognizant.com/global/en",
    createdBy: "admin-1",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    jobId: "job-1",
    userId: "student-1",
    status: "Interview",
    appliedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Followed up with HR on LinkedIn. Interview scheduled for next Monday.",
    resumeName: "john_doe_resume.pdf",
    resumeUrl: "/uploads/mock-resume.pdf",
    interviewDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "app-2",
    jobId: "job-2",
    userId: "student-1",
    status: "Applied",
    appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Applied directly through corporate careers portal.",
    resumeName: "john_doe_resume.pdf",
    resumeUrl: "/uploads/mock-resume.pdf",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

class FileDB {
  private async ensureDataDir() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
      // already exists or error
    }
    await this.ensureFile("users.json", INITIAL_USERS);
    await this.ensureFile("jobs.json", INITIAL_JOBS);
    await this.ensureFile("applications.json", INITIAL_APPLICATIONS);
  }

  private async ensureFile(filename: string, defaultData: any) {
    const filePath = path.join(DATA_DIR, filename);
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), "utf8");
    }
  }

  private async read<T>(filename: string): Promise<T[]> {
    await this.ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data) as T[];
  }

  private async write<T>(filename: string, data: T[]): Promise<void> {
    await this.ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  }

  // --- Users Collection ---
  public users = {
    find: async (filter?: Partial<User>): Promise<User[]> => {
      const items = await this.read<User>("users.json");
      if (!filter) return items;
      return items.filter(item => {
        return Object.entries(filter).every(([key, val]) => (item as any)[key] === val);
      });
    },
    findOne: async (filter: Partial<User>): Promise<User | null> => {
      const items = await this.read<User>("users.json");
      const found = items.find(item => {
        return Object.entries(filter).every(([key, val]) => (item as any)[key] === val);
      });
      return found || null;
    },
    findById: async (id: string): Promise<User | null> => {
      const items = await this.read<User>("users.json");
      return items.find(item => item.id === id) || null;
    },
    create: async (data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> => {
      const items = await this.read<User>("users.json");
      const newUser: User = {
        ...data,
        id: "usr-" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      items.push(newUser);
      await this.write<User>("users.json", items);
      return newUser;
    },
    findByIdAndUpdate: async (id: string, updates: Partial<User>): Promise<User | null> => {
      const items = await this.read<User>("users.json");
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return null;
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await this.write<User>("users.json", items);
      return items[index];
    },
    findByIdAndDelete: async (id: string): Promise<boolean> => {
      const items = await this.read<User>("users.json");
      const initialLength = items.length;
      const filtered = items.filter(item => item.id !== id);
      await this.write<User>("users.json", filtered);
      return filtered.length < initialLength;
    }
  };

  // --- Jobs Collection ---
  public jobs = {
    find: async (filter?: Partial<Job>): Promise<Job[]> => {
      const items = await this.read<Job>("jobs.json");
      if (!filter) return items;
      return items.filter(item => {
        return Object.entries(filter).every(([key, val]) => (item as any)[key] === val);
      });
    },
    findOne: async (filter: Partial<Job>): Promise<Job | null> => {
      const items = await this.read<Job>("jobs.json");
      const found = items.find(item => {
        return Object.entries(filter).every(([key, val]) => (item as any)[key] === val);
      });
      return found || null;
    },
    findById: async (id: string): Promise<Job | null> => {
      const items = await this.read<Job>("jobs.json");
      return items.find(item => item.id === id) || null;
    },
    create: async (data: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> => {
      const items = await this.read<Job>("jobs.json");
      const newJob: Job = {
        ...data,
        id: "job-" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      items.push(newJob);
      await this.write<Job>("jobs.json", items);
      return newJob;
    },
    findByIdAndUpdate: async (id: string, updates: Partial<Job>): Promise<Job | null> => {
      const items = await this.read<Job>("jobs.json");
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return null;
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await this.write<Job>("jobs.json", items);
      return items[index];
    },
    findByIdAndDelete: async (id: string): Promise<boolean> => {
      const items = await this.read<Job>("jobs.json");
      const initialLength = items.length;
      const filtered = items.filter(item => item.id !== id);
      await this.write<Job>("jobs.json", filtered);
      return filtered.length < initialLength;
    }
  };

  // --- Applications Collection ---
  public applications = {
    find: async (filter?: Partial<Application>): Promise<Application[]> => {
      const items = await this.read<Application>("applications.json");
      if (!filter) return items;
      return items.filter(item => {
        return Object.entries(filter).every(([key, val]) => (item as any)[key] === val);
      });
    },
    findOne: async (filter: Partial<Application>): Promise<Application | null> => {
      const items = await this.read<Application>("applications.json");
      const found = items.find(item => {
        return Object.entries(filter).every(([key, val]) => (item as any)[key] === val);
      });
      return found || null;
    },
    findById: async (id: string): Promise<Application | null> => {
      const items = await this.read<Application>("applications.json");
      return items.find(item => item.id === id) || null;
    },
    create: async (data: Omit<Application, "id" | "createdAt" | "updatedAt">): Promise<Application> => {
      const items = await this.read<Application>("applications.json");
      const newApp: Application = {
        ...data,
        id: "app-" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      items.push(newApp);
      await this.write<Application>("applications.json", items);
      return newApp;
    },
    findByIdAndUpdate: async (id: string, updates: Partial<Application>): Promise<Application | null> => {
      const items = await this.read<Application>("applications.json");
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return null;
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await this.write<Application>("applications.json", items);
      return items[index];
    },
    findByIdAndDelete: async (id: string): Promise<boolean> => {
      const items = await this.read<Application>("applications.json");
      const initialLength = items.length;
      const filtered = items.filter(item => item.id !== id);
      await this.write<Application>("applications.json", filtered);
      return filtered.length < initialLength;
    }
  };
}

export const db = new FileDB();
