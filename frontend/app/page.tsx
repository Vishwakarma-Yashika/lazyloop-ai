"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

type Suggestions = {
  category: string;
  suggested_filename: string;
  summary: string;
  action_items: string[];
};

type Analysis = {
  original_filename: string;
  stored_filename: string;
  bytes: number;
  status: string;
  suggestions: Suggestions;
  note: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [filename, setFilename] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<"unknown" | "online" | "offline">("unknown");

  async function checkBackend() {
    try {
      const response = await fetch(`${API_BASE}/`);
      if (!response.ok) throw new Error("Backend unavailable");
      setBackendStatus("online");
    } catch {
      setBackendStatus("offline");
    }
  }

  async function analyze(file?: File) {
    if (!file) return;
    setError("");
    setAnalysis(null);
    setFilename(file.name);

    if (!/\.(txt|pdf)$/i.test(file.name)) {
      setError("Please choose a .txt or .pdf file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is larger than the 10 MB limit.");
      return;
    }

    setBusy(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Analysis failed.");
      }
      setAnalysis(payload as Analysis);
      setBackendStatus("online");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBackendStatus("offline");
    } finally {
      setBusy(false);
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    void analyze(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void analyze(event.dataTransfer.files?.[0]);
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e5dc] pb-5">
          <a href="/" className="flex items-center gap-3 no-underline">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#214d36] text-xl text-white">↻</span>
            <span>
              <span className="block text-lg font-bold tracking-tight">LazyLoop <span className="text-[#4c875e]">AI</span></span>
              <span className="block text-xs text-[#68746b]">Your local-first digital helper</span>
            </span>
          </a>
          <div className="flex items-center gap-2 rounded-full border border-[#dce3d8] bg-white px-3 py-2 text-xs font-medium text-[#4c6252]">
            <span className={`h-2 w-2 rounded-full ${backendStatus === "online" ? "bg-emerald-500" : backendStatus === "offline" ? "bg-rose-500" : "bg-amber-400"}`} />
            {backendStatus === "online" ? "Local backend connected" : backendStatus === "offline" ? "Backend not connected" : "Checking local setup"}
            <button onClick={() => void checkBackend()} className="ml-1 underline underline-offset-2">Check</button>
          </div>
        </header>

        <section className="grid items-center gap-10 py-12 md:grid-cols-[1.15fr_.85fr] md:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9e5d7] bg-[#edf4e9] px-3 py-1.5 text-xs font-semibold text-[#356347]">
              <span>✳</span> SLOW DOWN. WE’LL SORT IT OUT.
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl">
              Less digital mess.<br /><span className="text-[#4b8259]">More breathing room.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#69746b]">
              Drop in a document. Your local AI suggests where it belongs, gives it a clearer name, and pulls out the next steps. You stay in control.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-[#536357]">
              <span className="rounded-full bg-white px-3 py-2">◉ Local AI with Ollama</span>
              <span className="rounded-full bg-white px-3 py-2">♧ Review before action</span>
              <span className="rounded-full bg-white px-3 py-2">↗ No hosted AI API</span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e3e7dc] bg-white p-5 shadow-[0_18px_60px_rgba(33,77,54,0.08)] sm:p-7">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">Your tidy-up space</p>
                <p className="mt-1 text-xs text-[#818b81]">Start with one file. Take it from there.</p>
              </div>
              <span className="rounded-xl bg-[#eff5ed] px-3 py-2 text-lg">⌘</span>
            </div>

            <div
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${dragging ? "border-[#4b8259] bg-[#eef6eb]" : "border-[#dce4d8] bg-[#fafbf8]"}`}
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e9f1e5] text-2xl">↥</div>
              <p className="mt-4 font-semibold">Drop your digital clutter</p>
              <p className="mt-2 text-xs leading-5 text-[#818b81]">PDF or TXT · Up to 10 MB</p>
              <button
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="mt-5 rounded-xl bg-[#214d36] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183b28] disabled:opacity-60"
              >
                {busy ? "Thinking locally…" : "Choose a file"}
              </button>
              <input ref={inputRef} type="file" accept=".txt,.pdf,text/plain,application/pdf" onChange={onInputChange} className="hidden" />
              <p className="mt-4 text-[11px] text-[#8a948b]">Your file is processed by the local backend and Ollama model.</p>
            </div>

            {error && (
              <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
            )}

            {busy && (
              <div className="mt-4 rounded-xl bg-[#f3f6f0] p-4 text-sm text-[#526455]">
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[#dce8d8]"><div className="h-full w-2/3 animate-pulse rounded-full bg-[#4b8259]" /></div>
                Reading <strong>{filename}</strong> and asking your local model for suggestions…
              </div>
            )}
          </div>
        </section>

        {analysis && (
          <section className="mb-12 rounded-[2rem] border border-[#dfe7db] bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64806a]">Your AI review</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Here’s a tidier way forward.</h2>
                <p className="mt-2 text-sm text-[#788379]">{analysis.original_filename} · {formatBytes(analysis.bytes)}</p>
              </div>
              <span className="rounded-full bg-[#edf5e9] px-3 py-1.5 text-xs font-semibold text-[#356347]">{analysis.suggestions.category}</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#f7f8f3] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7d887d]">Suggested filename</p>
                <p className="mt-2 break-words font-semibold">{analysis.suggestions.suggested_filename || "No filename suggestion"}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#7d887d]">Summary</p>
                <p className="mt-2 text-sm leading-6 text-[#536157]">{analysis.suggestions.summary}</p>
              </div>
              <div className="rounded-2xl bg-[#f7f8f3] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7d887d]">Possible next steps</p>
                {analysis.suggestions.action_items.length ? (
                  <ul className="mt-3 space-y-3">
                    {analysis.suggestions.action_items.map((item, index) => (
                      <li key={`${index}-${item}`} className="flex gap-3 text-sm leading-5 text-[#536157]">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e2eddd] text-xs text-[#356347]">{index + 1}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-sm text-[#788379]">No action items suggested.</p>}
              </div>
            </div>
            <p className="mt-5 rounded-xl border border-[#e7eadf] p-3 text-xs leading-5 text-[#748074]">Review these suggestions before acting. This starter does not rename or move your original files automatically.</p>
          </section>
        )}

        <section className="grid gap-4 border-t border-[#e2e5dc] py-8 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#edf2e9] p-5">
            <p className="text-2xl">⌂</p><h3 className="mt-3 font-semibold">Private by design</h3>
            <p className="mt-2 text-sm leading-6 text-[#68746b]">Local model inference keeps document contents off a hosted AI API.</p>
          </div>
          <div className="rounded-2xl bg-[#edf2e9] p-5">
            <p className="text-2xl">↻</p><h3 className="mt-3 font-semibold">Less busywork</h3>
            <p className="mt-2 text-sm leading-6 text-[#68746b]">Get useful names, categories, summaries, and next steps in one pass.</p>
          </div>
          <div className="rounded-2xl bg-[#edf2e9] p-5">
            <p className="text-2xl">☘</p><h3 className="mt-3 font-semibold">You stay in charge</h3>
            <p className="mt-2 text-sm leading-6 text-[#68746b]">AI recommends. You review. No hidden file changes.</p>
          </div>
        </section>

        <footer className="flex flex-wrap justify-between gap-3 border-t border-[#e2e5dc] py-5 text-xs text-[#818b81]">
          <span>LazyLoop AI · Open-weight AI, local-first workflows.</span>
          <span>Made for a slower, calmer digital life.</span>
        </footer>
      </div>
    </main>
  );
}
