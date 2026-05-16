# 🤖 Creator AI Dashboard (Master Plan)

A high-performance, GenAI-powered ecosystem designed for modern content creators. This platform goes beyond "AI Wrappers" by implementing **Context Engineering**, **Parallel AI Workflows**, and **Style Learning**.

---

## 🚀 Vision
To build a "Stark-level" OS for creators that transforms long-form content (YouTube/Podcasts) into high-engaging social media assets across all major platforms using the **Gemini 1.5 Flash** engine.

## 🧠 Core Philosophy: Context Engineering
Most AI tools fail because of poor context. This project implements a **Context Layer** that injects:
- **Role Identity:** Defining AI as a viral growth expert.
- **Brand Voice:** Learning and mimicking the user's writing style.
- **Platform Constraints:** Specific rules for LinkedIn, Twitter, IG, and Blogs.
- **Few-Shot Examples:** Providing high-quality examples to ensure premium output.

---

## 🛠️ Tech Stack
- **Frontend:** React 18, Tailwind CSS, Framer Motion, Zustand (State Management).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (Mongoose).
- **AI Engine:** Gemini 1.5 Flash API (Primary) + OpenAI (Fallback).
- **Extraction:** `youtube-transcript` npm package.
- **Deployment:** Vercel (Client), Render (Server).

---

## 📂 Project Structure
```text
creator-ai-dashboard/
├── client/
│   ├── src/
│   │   ├── components/       # Layout, Dashboard, OutputCards, Skeletons
│   │   ├── store/            # Zustand State (Auth, Content, UI)
│   │   ├── hooks/            # useGenerate, useTranscript
│   │   └── services/         # API (Axios setup)
├── server/
│   ├── config/               # db.js (MongoDB Atlas), ai.config.js
│   ├── routes/               # content.routes.js, user.routes.js
│   ├── controllers/          # content.controller.js
│   ├── services/             # transcript.service, ai.service, prompt.service
│   ├── prompts/              # Platform-specific prompt templates
│   ├── models/               # Generation.model, User.model
│   ├── utils/                # chunker.js, validator.js, logger.js
│   └── app.js
└── .env
```

---

## 📅 15-Day Roadmap

### Phase I: Foundation & AI Brain
- **Day 1:** Environment Setup & Backend Boilerplate.
- **Day 2:** YouTube Transcript Engine + Error Handling.
- **Day 3:** Gemini API Integration (Single Flow).
- **Day 4:** **Context Layer & Parallel Generation** (5-Platform Pipeline).
- **Day 5:** MongoDB Atlas Integration (Generation History).
- **Day 6:** API Routes & Frontend-Backend Connection.

### Phase II: Premium UI/UX
- **Day 7:** Dashboard Layout (Dark Mode, Sidebar, Glassmorphism).
- **Day 8:** Input Panel & Loading Skeletons (UX Focus).
- **Day 9:** Output Display System (Tabs, Markdown, Cards).
- **Day 10:** Tone & Platform Selection Logic.

### Phase III: Advanced Features
- **Day 11:** History Dashboard (View/Delete past content).
- **Day 12:** "Edit & Copy" System (Interactive text areas).
- **Day 13:** Brand Voice Profile (Simple Style Learning).

### Phase IV: Launch
- **Day 14:** Vercel & Render Deployment + Env Setup.
- **Day 15:** Final Polish, Animations, and Bug Squashing.

---

## 🔐 Environment Variables (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/creator-ai
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🎯 Key Differentiators (Recruiter/Startup Ready)
1. **Parallel Generation:** Using `Promise.allSettled` to generate 5 types of content simultaneously without blocking.
2. **Robust Validation:** Every AI response is validated as JSON before being sent to the UI.
3. **Smart Chunking:** Handling 1-hour long transcripts by intelligent context selection.
4. **Creator Style Learning:** Implementing few-shot prompting to match the user's unique tone.

---
*Created with ❤️ by Antigravity (AI Assistant) for Aadi AI.*
