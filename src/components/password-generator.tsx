"use client";

import { useState } from "react";

export default function PasswordGenerator() {
  const [len, setLen] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [nums, setNums] = useState(true);
  const [syms, setSyms] = useState(true);
  const [out, setOut] = useState("");

  const gen = () => {
    const sets = [];
    if (upper) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (lower) sets.push("abcdefghijklmnopqrstuvwxyz");
    if (nums) sets.push("0123456789");
    if (syms) sets.push("!@#$%^&*()-_=+[]{}");
    if (!sets.length) {
      setOut("Selecione ao menos um conjunto");
      return;
    }
    const all = sets.join("");
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    setOut(Array.from(arr, (v) => all[v % all.length]).join(""));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-1">
          Tamanho
          <input type="number" min={4} max={128} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-16 rounded-md border border-border bg-background px-2 py-1" />
        </label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Maiúsculas</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} /> Minúsculas</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={nums} onChange={(e) => setNums(e.target.checked)} /> Números</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={syms} onChange={(e) => setSyms(e.target.checked)} /> Símbolos</label>
      </div>
      <button onClick={gen} className="w-fit rounded-md bg-foreground px-3 py-1.5 text-sm text-background">Gerar</button>
      <textarea value={out} readOnly className="h-20 w-full rounded-md border border-border bg-card p-3 font-mono text-sm" />
    </div>
  );
}