"use client";

import { useState } from "react";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    try {
      setOutput(btoa(unescape(encodeURIComponent(input))));
    } catch {
      setOutput("Erro ao codificar");
    }
  };

  const decode = () => {
    try {
      setOutput(decodeURIComponent(escape(atob(input))));
    } catch {
      setOutput("Erro ao decodificar");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Texto ou Base64"
        className="h-32 w-full rounded-md border border-border bg-background p-3 font-mono text-sm"
      />
      <div className="flex gap-2">
        <button onClick={encode} className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background">Codificar</button>
        <button onClick={decode} className="rounded-md border border-border px-3 py-1.5 text-sm">Decodificar</button>
      </div>
      <textarea
        value={output}
        readOnly
        className="h-32 w-full rounded-md border border-border bg-card p-3 font-mono text-sm"
      />
    </div>
  );
}