"use client";

import { useState } from "react";

export default function JsonValidator() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");

  const validate = () => {
    try {
      JSON.parse(input);
      setStatus("✓ JSON válido");
    } catch (e) {
      setStatus("✗ " + (e instanceof Error ? e.message : "inválido"));
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
      <button onClick={validate} className="w-fit rounded-md bg-foreground px-3 py-1.5 text-sm text-background">
        Validar
      </button>
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}