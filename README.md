# Full-Stack Email Job Scheduler — Frontend Dashboard

A modern, responsive React dashboard built with TypeScript, Tailwind CSS, Vite, and Firebase Authentication, designed after the ReachInbox scheduler specification.

---

## 1. Features

- **Google OAuth Login**: Real Google authentication powered by Firebase with automatic session management, user profile avatar, name, and logout.
- **Scheduled Emails Table**: Real-time listing of scheduled emails displaying recipient, subject, body snippet, scheduled time, and status pills with loading and empty states.
- **Sent & Failed Emails Table**: Listing of delivered and failed emails displaying actual sent timestamps and color-coded status badges.
- **Rich Email Composer**:
  - Subject and formatted HTML body using TipTap rich text editor (bold, italic, headings, lists, alignment, undo/redo).
  - Bulk lead upload (CSV / TXT) with automatic email address extraction and detected lead count badge.
  - Granular delivery controls: Start time picker, per-email delay interval (seconds), and hourly send limits.
  - Multi-file attachment support with live thumbnail previews and removal controls.
- **Email Detail View**: Detailed inspection page displaying full headers (From, To, Status, Scheduled/Sent at), rendered body content, and downloadable attachments.

---

## 2. Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Design System
- **Authentication**: Firebase Authentication (Google Provider)
- **Editor**: TipTap Rich Text Editor
- **Icons**: Lucide React
- **Routing**: React Router v7

---

## 3. Environment Variables

Create a `.env` file in the `frontend/` directory (or use `.env.example`):

```ini
VITE_API_URL=http://localhost:5000/api/emails
```

*Note: For production deployments, set `VITE_API_URL` to your deployed backend API URL (e.g. `https://your-backend.onrender.com/api/emails`).*

---

## 4. Getting Started

### Prerequisites
- Node.js (v18+)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### Step 3: Production Build
```bash
npm run build
```
Generates production-ready static assets in the `dist/` directory.
