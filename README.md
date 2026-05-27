# VedaAI – AI Assessment Creator

Full stack assessment creator built for the VedaAI assignment.

## What It Does

- Create an assessment with title, due date, question type, number of questions, marks, and optional file upload.
- Generate a structured question paper with sections, questions, difficulty tags, and marks.
- Show generation status in real time with WebSocket updates.
- Export the final paper as a properly formatted PDF.

## Stack

- Frontend: Next.js, TypeScript, Zustand, Socket.IO client
- Backend: Node.js, Express, MongoDB, BullMQ, Socket.IO
- PDF export: `@react-pdf/renderer`

## Architecture

1. The frontend submits an assessment form.
2. The backend stores the assignment in MongoDB.
3. If `REDIS_URL` is configured, the job is queued with BullMQ.
4. A worker generates the structured paper and saves the result.
5. The backend emits a Socket.IO update back to the frontend.
6. The frontend renders the paper and can export it to PDF.

If Redis is not configured, the backend falls back to inline generation so the project still works locally.

## Setup

### 1. Install dependencies

```powershell
cd C:\Users\DELL\OneDrive\Desktop\veda-ai-assignment\frontend
npm install

cd C:\Users\DELL\OneDrive\Desktop\veda-ai-assignment\backend
npm install
```

### 2. Configure backend env

Create or update `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000
# Optional, enables BullMQ queue processing
REDIS_URL=redis://localhost:6379
```

### 3. Run the apps

```powershell
cd C:\Users\DELL\OneDrive\Desktop\veda-ai-assignment\backend
npm start
```

```powershell
cd C:\Users\DELL\OneDrive\Desktop\veda-ai-assignment\frontend
npm run dev
```

## Notes

- The backend serves the API at `http://localhost:5000`.
- The frontend runs at `http://localhost:3000`.
- File upload accepts PDF or TXT.
- The paper is rendered from structured data rather than a raw LLM dump.

## Links

- GitHub Repo: https://github.com/BHAVANABHAVANAREDDY/veda-ai-assignment
- Live Demo: https://veda-ai-assignment-roan.vercel.app
