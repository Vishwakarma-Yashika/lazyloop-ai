# LazyLoop AI

A local-first AI file organizer starter project using Next.js, Tailwind CSS, FastAPI, and Ollama.

## Requirements

- Node.js 20+ and npm
- Python 3.10+
- Ollama installed locally
- A model pulled in Ollama (example: `ollama pull phi3`)

## Project structure

```text
lazyloop-ai/
├── frontend/       # Next.js App Router + Tailwind CSS
└── backend/        # FastAPI upload and local-model analysis API
```

## 1. Start Ollama

In a terminal:

```powershell
ollama pull phi3
ollama serve
```

If Ollama is already running as a Windows service/app, you may not need `ollama serve`.
Check installed models with `ollama list`.

## 2. Start the backend

Open PowerShell in the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend docs: http://localhost:8000/docs

On macOS/Linux, activate with `source venv/bin/activate`.

## 3. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## What this starter does

- Uploads `.txt` and `.pdf` files to the local FastAPI backend.
- Extracts text from supported files.
- Sends extracted text to a local Ollama model for a suggested category, filename, and action items.
- Shows suggested actions in the browser for review.
- Does not automatically move or rename original files yet.

## Important safety notes

This is a development starter, not a production-ready file manager. Uploads are saved only inside `backend/uploads`. Review all model suggestions. The model output is treated as untrusted data and is never executed as a command. Add authentication, upload size limits, malware scanning, and more robust validation before exposing this app to a network.

## API

- `GET /` — health check
- `GET /health/ollama` — check local Ollama connectivity
- `POST /analyze` — upload a `.txt` or `.pdf` file and get AI suggestions

Ollama is expected at `http://localhost:11434` and the default model is `phi3`. Set `OLLAMA_MODEL` to use another locally installed model.
