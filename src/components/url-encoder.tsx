"use client";

import { useState } from "react";

export default function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="URL ou texto"
        className="h-24 w-full rounded-md border border-border bg-background p-3 font-mono text-sm"
      />
      <div className="flex gap-2">
        <button onClick={() => setOutput(encodeURIComponent(input))} className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background">
          Codificar
        </button>
        <button onClick={() => { try { setOutput(decodeURIComponent(input)); } catch { setOutput("Erro"); } }} className="rounded-md border border-border px-3 py-1.5 text-sm">
          Decodificar
        </button>
      </div>
      <textarea value={output} readOnly className="h-24 w-full rounded-md border border-border bg-card p-3 font-mono text-sm" />
    </div>
  );
}