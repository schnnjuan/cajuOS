"use client";

import { useState } from "react";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = () => {
    try {
      const v = JSON.parse(input);
      setOutput(JSON.stringify(v, null, 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON inválido");
      setOutput("");
    }
  };

  const minify = () => {
    try {
      const v = JSON.parse(input);
      setOutput(JSON.stringify(v));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON inválido");
      setOutput("");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"a":1}'
        className="h-40 w-full rounded-md border border-border bg-background p-3 font-mono text-sm"
      />
      <div className="flex gap-2">
        <button onClick={format} className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background">Formatar</button>
        <button onClick={minify} className="rounded-md border border-border px-3 py-1.5 text-sm">Minificar</button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <textarea
        value={output}
        readOnly
        className="h-40 w-full rounded-md border border-border bg-card p-3 font-mono text-sm"
      />
    </div>
  );
}