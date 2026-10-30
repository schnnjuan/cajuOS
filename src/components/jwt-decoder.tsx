"use client";

import { useState } from "react";

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad)));
}

export default function JwtDecoder() {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState("");

  const decode = () => {
    setError("");
    const parts = input.trim().split(".");
    if (parts.length < 2) {
      setError("JWT inválido");
      setHeader("");
      setPayload("");
      return;
    }
    try {
      setHeader(JSON.stringify(JSON.parse(b64urlDecode(parts[0])), null, 2));
      setPayload(JSON.stringify(JSON.parse(b64urlDecode(parts[1])), null, 2));
    } catch {
      setError("Falha ao decodificar");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="cole o JWT"
        className="h-24 w-full rounded-md border border-border bg-background p-3 font-mono text-sm"
      />
      <button onClick={decode} className="w-fit rounded-md bg-foreground px-3 py-1.5 text-sm text-background">
        Decodificar
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <label className="text-xs text-muted">Header</label>
      <textarea value={header} readOnly className="h-28 w-full rounded-md border border-border bg-card p-3 font-mono text-sm" />
      <label className="text-xs text-muted">Payload</label>
      <textarea value={payload} readOnly className="h-32 w-full rounded-md border border-border bg-card p-3 font-mono text-sm" />
    </div>
  );
}