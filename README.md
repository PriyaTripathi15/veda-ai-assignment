# VedaAI - AI Assessment Creator

A full-stack assessment generator for teachers. The app lets a teacher create an assignment, upload optional source material, define question types and scoring, and generate a structured question paper with AI-assisted content.

## What It Does

- Create a new assignment from a clean form UI
- Upload optional PDF or text source material
- Set due date, subject, class/section, duration, and instructions
- Configure question mix, counts, and marks
- Generate a structured paper with sections, difficulty tags, and marks
- View the generated output in a readable exam-paper layout
- Download the generated paper as PDF
- Receive live generation updates over WebSocket

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Zustand for state management
- Socket.IO client
- React PDF for export

### Backend

- Node.js + Express
- MongoDB for assignments and generated results
- Redis / BullMQ for queued background processing
- Socket.IO for real-time job updates
- AI service that converts form input into a structured paper

## Architecture

1. The teacher submits the assignment form from the frontend.
2. The backend validates and stores the assignment in MongoDB.
3. If a queue is available, the job is pushed to BullMQ; otherwise it is processed immediately.
4. The worker / processor builds a structured paper with sections, questions, marks, and difficulty.
5. The backend persists the generated result and emits WebSocket updates.
6. The frontend listens for those updates and renders the paper preview.

## Project Structure

- `frontend/` - Next.js app, form UI, generated paper preview, PDF export
- `backend/` - Express API, assignment routes, queue, worker, AI generator

## Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Create the needed `.env` files in `backend/` and `frontend/`.

Example backend variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_if_used
```

Example frontend variables:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 3. Run the app

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

## Notes

- File upload is optional.
- The generated paper is structured before rendering; it does not print raw model output directly.
- PDF export uses a dedicated document component for clean formatting.
- The UI is designed to stay readable on desktop and mobile.

## Submission

- GitHub repository
- Deployed link
- README with setup and architecture details

