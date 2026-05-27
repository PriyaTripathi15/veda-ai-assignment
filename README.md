# VedaAI - AI Assessment Creator

VedaAI is a full-stack assessment generator for teachers. It lets a user create an assignment, optionally attach source material, generate a structured question paper, and view or download the final output in a clean exam-paper layout.

## Features

- Create assignments with due date, question types, counts, marks, and instructions
- Upload optional PDF or text source material
- Generate a structured paper with sections, questions, difficulty tags, and marks
- Receive live job updates over WebSocket
- View the generated paper on a dedicated page
- Download the paper as PDF
- Responsive UI inspired by the provided Figma design

## Tech Stack

### Frontend

- Next.js + TypeScript
- Zustand for state management
- Socket.IO client
- React PDF for export

### Backend

- Node.js + Express with TypeScript entrypoints
- MongoDB for assignments and generated results
- Redis + BullMQ for queued background processing
- Socket.IO for real-time updates
- Structured paper generator that builds the paper before rendering

## Architecture

1. Teacher submits the assignment form from the frontend.
2. Backend validates the payload and stores the assignment in MongoDB.
3. If Redis is configured, the job is pushed to BullMQ; otherwise it is processed immediately.
4. The worker builds a structured paper with sections, questions, difficulty, and marks.
5. The backend stores the generated result and emits WebSocket updates.
6. The frontend listens for updates and renders the paper preview.

## Project Structure

- `frontend/` - Next.js app, form UI, generated paper preview, PDF export
- `backend/` - Express API, TypeScript server, queue, worker, AI generator

## Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Create `.env` files in both `backend/` and `frontend/`.

Backend example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
FRONTEND_URL=http://localhost:3000
```

Frontend example:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 3. Run locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

### 4. Build backend for production

```bash
cd backend
npm run build
npm start
```

## Notes

- File upload is optional.
- The generated paper is structured before rendering; it does not print raw model output directly.
- PDF export uses a dedicated document component for clean formatting.
- The UI is designed to stay readable on desktop and mobile.

## Submission Checklist

- GitHub repository
- Deployed link
- README with setup and architecture details

