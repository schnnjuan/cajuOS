"use client";

import { useEffect, useMemo, useState } from "react";

const STORE_KEY = "cajuos:churrasco";

type Inputs = { h: number; m: number; c: number; horas: number; bebem: number | null };

const DEFAULTS: Inputs = { h: 5, m: 3, c: 2, horas: 4, bebem: null };

function clamp(n: number): number {
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function load(): Inputs {
  // URL params vencem o localStorage (link compartilhado).
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search);
    const fromUrl = {
      h: Number(q.get("h")),
      m: Number(q.get("m")),
      c: Number(q.get("c")),
      horas: Number(q.get("t")),
      bebem: q.has("b") ? Number(q.get("b")) : null,
    };
    if (q.has("h") || q.has("m") || q.has("c")) {
      return {
        h: clamp(fromUrl.h),
        m: clamp(fromUrl.m),
        c: clamp(fromUrl.c),
        horas: clamp(fromUrl.horas) || 4,
        bebem: fromUrl.bebem == null ? null : clamp(fromUrl.bebem),
      };
    }
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Inputs>) };
    } catch {
      // ignora storage corrompido
    }
  }
  return DEFAULTS;
}

export default function ChurrascoCalculator() {
  const [inputs, setInputs] = useState<Inputs>(() =>
    typeof window === "undefined" ? DEFAULTS : load(),
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(inputs));
    } catch {
      // storage cheio/bloqueado: segue sem persistir
    }
  }, [inputs]);

  const set = (k: keyof Inputs) => (v: string) => {
    const n = v === "" ? 0 : Number(v);
    setInputs((p) => ({ ...p, [k]: k === "bebem" && v === "" ? null : clamp(n) }));
  };

  const r = useMemo(() => {
    const { h, m, c, horas } = inputs;
    const bebem = inputs.bebem ?? h + m;
    const longo = horas > 4;
    const f = longo ? 1.2 : 1;
    const carneKg = Math.ceil(((h * 0.45 + m * 0.35 + c * 0.2) * f) * 2) / 2;
    const latas = Math.ceil(bebem * 4 * f);
    const carvaoKg = carneKg > 0 ? Math.max(3, Math.ceil(carneKg)) : 0;
    return {
      pessoas: h + m + c,
      bebem,
      longo,
      carneKg,
      latas,
      packs12: Math.ceil(latas / 12),
      carvaoKg,
      sacosCarvao: Math.ceil(carvaoKg / 3),
      paoAlho: (h + m) * 2 + c,
      geloSacos: latas > 0 ? Math.max(1, Math.ceil(latas / 36)) : 0,
      salG: carneKg > 0 ? Math.ceil(carneKg / 3) * 100 : 0,
    };
  }, [inputs]);

  const lista = useMemo(() => {
    const p: string[] = [];
    p.push(`🥩 CHURRASCO — ${r.pessoas} pessoas (${inputs.h}H ${inputs.m}M ${inputs.c}C, ~${inputs.horas}h)`);
    if (r.carneKg > 0) p.push(`· Carne: ${r.carneKg.toString().replace(".", ",")} kg`);
    if (r.latas > 0) p.push(`· Cerveja: ${r.latas} latas (${r.packs12} pack${r.packs12 > 1 ? "s" : ""} de 12)`);
    if (r.carvaoKg > 0) p.push(`· Carvão: ${r.carvaoKg} kg (${r.sacosCarvao} saco${r.sacosCarvao > 1 ? "s" : ""} de 3 kg)`);
    if (r.paoAlho > 0) p.push(`· Pão de alho: ${r.paoAlho} un`);
    if (r.geloSacos > 0) p.push(`· Gelo: ${r.geloSacos} saco${r.geloSacos > 1 ? "s" : ""} de 5 kg`);
    if (r.salG > 0) p.push(`· Sal grosso: ${r.salG} g`);
    p.push("cajuos.dev/tools/churrasco");
    return p.join("\n");
  }, [r, inputs]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lista);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard bloqueado: usuário copia manual
    }
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(lista)}`;

  const fields: { key: keyof Inputs; label: string; value: number | null; placeholder?: string }[] = [
    { key: "h", label: "Homens", value: inputs.h },
    { key: "m", label: "Mulheres", value: inputs.m },
    { key: "c", label: "Crianças", value: inputs.c },
    { key: "horas", label: "Horas de festa", value: inputs.horas },
    { key: "bebem", label: "Bebem cerveja", value: inputs.bebem, placeholder: `${inputs.h + inputs.m} (todos adultos)` },
  ];

  const rows: [string, string][] = [
    ["Carne", r.carneKg > 0 ? `${r.carneKg.toString().replace(".", ",")} kg` : "—"],
    ["Cerveja (lata 350 ml)", r.latas > 0 ? `${r.latas} latas · ${r.packs12} pack${r.packs12 > 1 ? "s" : ""} de 12` : "—"],
    ["Carvão", r.carvaoKg > 0 ? `${r.carvaoKg} kg · ${r.sacosCarvao} saco${r.sacosCarvao > 1 ? "s" : ""} de 3 kg` : "—"],
    ["Pão de alho", r.paoAlho > 0 ? `${r.paoAlho} un` : "—"],
    ["Gelo (saco 5 kg)", r.geloSacos > 0 ? `${r.geloSacos} saco${r.geloSacos > 1 ? "s" : ""}` : "—"],
    ["Sal grosso", r.salG > 0 ? `${r.salG} g` : "—"],
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-muted">{f.label}</span>
            <input
              type="number"
              min={0}
              value={f.value ?? ""}
              placeholder={f.placeholder}
              onChange={(e) => set(f.key)(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-foreground"
            />
          </label>
        ))}
      </div>

      <ul className="mt-5 divide-y divide-border rounded-lg border border-border">
        {rows.map(([k, v]) => (
          <li key={k} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
            <span className="text-sm text-muted">{k}</span>
            <span className="text-sm font-medium">{v}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">
        Base: 450 g/adulto H · 350 g/adulto M · 200 g/criança · 4 latas por quem bebe
        {r.longo ? " · +20% (festa longa)" : ""}. Arredondado pra cima, sem miséria.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={copy}
          className="pressable rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {copied ? "Copiado!" : "Copiar lista"}
        </button>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="pressable rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:border-foreground"
        >
          Enviar no WhatsApp →
        </a>
      </div>
    </div>
  );
}
