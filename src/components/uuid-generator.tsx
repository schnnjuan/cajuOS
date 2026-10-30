"use client";

import { useState } from "react";

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [out, setOut] = useState("");

  const gen = () => {
    const list = Array.from({ length: Math.max(1, Math.min(100, count)) }, () => crypto.randomUUID());
    setOut(list.join("\n"));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm"
        />
        <button onClick={gen} className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background">
          Gerar
        </button>
      </div>
      <textarea value={out} readOnly className="h-40 w-full rounded-md border border-border bg-card p-3 font-mono text-sm" />
    </div>
  );
}