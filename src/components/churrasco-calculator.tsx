"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STORE_KEY = "cajuos:churrasco";

// Base de cálculo. Muda aqui, muda em tudo.
const BASE = { h: 0.45, m: 0.35, c: 0.2, latas: 4, longa: 1.2, longaHoras: 4 };
const CORTES: [string, number][] = [
  ["Picanha", 0.3],
  ["Contra-filé", 0.25],
  ["Fraldinha", 0.2],
  ["Linguiça", 0.25],
];
const ACOMP = [
  "Farofa",
  "Vinagrete",
  "Maionese",
  "Pão francês",
  "Guardanapos",
  "Copos descartáveis",
  "Pratos e talheres",
  "Sacos de lixo",
];

type Inputs = {
  h: number; m: number; c: number; horas: number;
  bebem: number | null; veg: number;
  pCarne: number; pLata: number; pCarvao: number; pGelo: number; pRefri: number;
};

const DEFAULTS: Inputs = {
  h: 5, m: 3, c: 2, horas: 4, bebem: null, veg: 0,
  pCarne: 0, pLata: 0, pCarvao: 0, pGelo: 0, pRefri: 0,
};

function clamp(n: number): number {
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function money(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function fmt(n: number): string {
  return n.toString().replace(".", ",");
}

function fmt1(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

function pl(n: number, um: string, varios?: string): string {
  return n === 1 ? um : (varios ?? `${um}s`);
}

function brl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function load(): { inputs: Inputs; checks: string[] } {
  // URL params vencem o localStorage (link compartilhado).
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search);
    if (q.has("h") || q.has("m") || q.has("c")) {
      const n = (k: string) => clamp(Number(q.get(k)));
      return {
        inputs: {
          ...DEFAULTS,
          h: n("h"), m: n("m"), c: n("c"),
          horas: n("t") || 4, veg: n("v"),
          bebem: q.has("b") ? n("b") : null,
        },
        checks: [],
      };
    }
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { inputs?: Partial<Inputs>; checks?: string[] };
        return {
          inputs: { ...DEFAULTS, ...(s.inputs ?? {}) },
          checks: Array.isArray(s.checks) ? s.checks.filter((x) => ACOMP.includes(x)) : [],
        };
      }
    } catch {
      // ignora storage corrompido
    }
  }
  return { inputs: DEFAULTS, checks: [] };
}

export default function ChurrascoCalculator() {
  const [saved] = useState(() => (typeof window === "undefined" ? null : load()));
  const [inputs, setInputs] = useState<Inputs>(saved?.inputs ?? DEFAULTS);
  const [checks, setChecks] = useState<string[]>(saved?.checks ?? []);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ inputs, checks }));
    } catch {
      // storage cheio/bloqueado: segue sem persistir
    }
  }, [inputs, checks]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const set = (k: keyof Inputs, fn: (n: number) => number = clamp) => (v: string) => {
    const n = v === "" ? 0 : Number(v);
    setInputs((p) => ({ ...p, [k]: k === "bebem" && v === "" ? null : fn(n) }));
  };
  const setMoney = (k: keyof Inputs) => set(k, money);

  const toggleCheck = (item: string) =>
    setChecks((p) => (p.includes(item) ? p.filter((x) => x !== item) : [...p, item]));

  const r = useMemo(() => {
    const { h, m, c, horas } = inputs;
    const adultos = h + m;
    const veg = Math.min(inputs.veg, adultos);
    const bebem = Math.min(inputs.bebem ?? adultos, adultos + c);
    const longo = horas > BASE.longaHoras;
    const f = longo ? BASE.longa : 1;
    // Vegetarianos saem da conta da carne (média ponderada dos adultos).
    const taxaAdulta = adultos > 0 ? (h * BASE.h + m * BASE.m) / adultos : 0;
    const carneKg = Math.ceil(((adultos - veg) * taxaAdulta + c * BASE.c) * f * 2) / 2;
    const latas = Math.ceil(bebem * BASE.latas * f);
    const carvaoKg = carneKg > 0 ? Math.max(3, Math.ceil(carneKg)) : 0;
    const naoBebem = Math.max(0, adultos + c - bebem);
    const refriL = naoBebem * 0.6;
    const pets = Math.ceil(refriL / 2);
    const aguaL = (adultos + c) * 0.5;
    const garrafasAgua = Math.ceil(aguaL / 1.5);
    const total =
      carneKg * inputs.pCarne +
      latas * inputs.pLata +
      Math.ceil(carvaoKg / 3) * inputs.pCarvao +
      (latas > 0 ? Math.max(1, Math.ceil(latas / 36)) : 0) * inputs.pGelo +
      pets * inputs.pRefri;
    return {
      pessoas: adultos + c, adultos, veg, bebem, longo,
      carneKg, latas,
      packs12: Math.ceil(latas / 12),
      carvaoKg,
      sacosCarvao: Math.ceil(carvaoKg / 3),
      paoAlho: adultos * 2 + c + veg,
      queijo: veg * 3,
      refriL, pets, aguaL, garrafasAgua,
      geloSacos: latas > 0 ? Math.max(1, Math.ceil(latas / 36)) : 0,
      salG: carneKg > 0 ? Math.ceil(carneKg / 3) * 100 : 0,
      total,
      porAdulto: adultos > 0 ? total / adultos : 0,
      faltam: ACOMP.filter((a) => !checks.includes(a)),
    };
  }, [inputs, checks]);

  const lista = useMemo(() => {
    const p: string[] = [];
    p.push(`🥩 CHURRASCO — ${r.pessoas} ${pl(r.pessoas, "pessoa")} (${inputs.h}H ${inputs.m}M ${inputs.c}C, ~${inputs.horas}h)`);
    if (r.carneKg > 0) {
      p.push(`· Carne: ${fmt(r.carneKg)} kg`);
      for (const [nome, pct] of CORTES) p.push(`   ${nome}: ${fmt1(r.carneKg * pct)} kg`);
    }
    if (r.latas > 0) p.push(`· Cerveja: ${r.latas} latas (${r.packs12} ${pl(r.packs12, "pack")} de 12)`);
    if (r.pets > 0) p.push(`· Refri: ${fmt1(r.refriL)} L (${r.pets} ${pl(r.pets, "PET", "PETs")} 2 L)`);
    if (r.garrafasAgua > 0) p.push(`· Água: ${fmt1(r.aguaL)} L (${r.garrafasAgua} ${pl(r.garrafasAgua, "garrafa")} 1,5 L)`);
    if (r.carvaoKg > 0) p.push(`· Carvão: ${r.carvaoKg} kg (${r.sacosCarvao} ${pl(r.sacosCarvao, "saco")} de 3 kg)`);
    if (r.paoAlho > 0) p.push(`· Pão de alho: ${r.paoAlho} un`);
    if (r.queijo > 0) p.push(`· Queijo coalho: ${r.queijo} espetos`);
    if (r.geloSacos > 0) p.push(`· Gelo: ${r.geloSacos} ${pl(r.geloSacos, "saco", "sacos")} de 5 kg`);
    if (r.salG > 0) p.push(`· Sal grosso: ${r.salG} g`);
    if (r.faltam.length > 0 && r.faltam.length < ACOMP.length) p.push(`· Falta comprar: ${r.faltam.join(", ").toLowerCase()}`);
    if (r.total > 0 && r.adultos > 0) p.push(`· Vaquinha: ${brl(r.total)} (${brl(r.porAdulto)}/adulto)`);
    p.push("cajuos.dev/tools/churrasco");
    return p.join("\n");
  }, [r, inputs]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lista);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard bloqueado: usuário copia manual
    }
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(lista)}`;

  const pessoas = [
    { key: "h", label: "Homens", value: inputs.h, fn: set("h") },
    { key: "m", label: "Mulheres", value: inputs.m, fn: set("m") },
    { key: "c", label: "Crianças", value: inputs.c, fn: set("c") },
    { key: "horas", label: "Horas", value: inputs.horas, fn: set("horas") },
    { key: "bebem", label: "Bebem", value: inputs.bebem, ph: `${inputs.h + inputs.m} (adultos)`, fn: set("bebem") },
    { key: "veg", label: "Vegetarianos", value: inputs.veg, fn: set("veg") },
  ] as const;

  const precos = [
    { label: "Carne R$/kg", value: inputs.pCarne || "", fn: setMoney("pCarne") },
    { label: "Lata R$", value: inputs.pLata || "", fn: setMoney("pLata") },
    { label: "Carvão R$/saco", value: inputs.pCarvao || "", fn: setMoney("pCarvao") },
    { label: "Gelo R$/saco", value: inputs.pGelo || "", fn: setMoney("pGelo") },
    { label: "Refri R$/PET", value: inputs.pRefri || "", fn: setMoney("pRefri") },
  ] as const;

  const rows: [string, string][] = [
    ["Carne", r.carneKg > 0 ? `${fmt(r.carneKg)} kg` : "—"],
    ["Cerveja (lata 350 ml)", r.latas > 0 ? `${r.latas} latas · ${r.packs12} ${pl(r.packs12, "pack")} de 12` : "—"],
    ["Refri (PET 2 L)", r.pets > 0 ? `${fmt1(r.refriL)} L · ${r.pets} ${pl(r.pets, "PET", "PETs")}` : "—"],
    ["Água (1,5 L)", r.garrafasAgua > 0 ? `${fmt1(r.aguaL)} L · ${r.garrafasAgua} ${pl(r.garrafasAgua, "garrafa")}` : "—"],
    ["Carvão", r.carvaoKg > 0 ? `${r.carvaoKg} kg · ${r.sacosCarvao} ${pl(r.sacosCarvao, "saco")} de 3 kg` : "—"],
    ["Pão de alho", r.paoAlho > 0 ? `${r.paoAlho} un` : "—"],
    ["Queijo coalho", r.queijo > 0 ? `${r.queijo} espetos` : "—"],
    ["Gelo (saco 5 kg)", r.geloSacos > 0 ? `${r.geloSacos} ${pl(r.geloSacos, "saco", "sacos")}` : "—"],
    ["Sal grosso", r.salG > 0 ? `${r.salG} g` : "—"],
  ];
  const vazio = r.pessoas === 0;
  const link = `cajuos.dev/tools/churrasco?h=${inputs.h}&m=${inputs.m}&c=${inputs.c}&t=${inputs.horas}&v=${inputs.veg}${inputs.bebem != null ? `&b=${inputs.bebem}` : ""}`;

  const numCls =
    "mt-1 block w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-foreground";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Povo</h3>
      <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {pessoas.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-muted">{f.label}</span>
            <input type="number" min={0} value={f.value ?? ""} placeholder={"ph" in f ? f.ph : undefined}
              onChange={(e) => f.fn(e.target.value)} className={numCls} />
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
        {r.carneKg > 0 && (
          <li className="px-4 py-2.5">
            <span className="text-sm text-muted">Sugestão de cortes</span>
            <ul className="mt-1 space-y-0.5">
              {CORTES.map(([nome, pct]) => (
                <li key={nome} className="flex justify-between text-sm">
                  <span className="text-muted">· {nome} ({Math.round(pct * 100)}%)</span>
                  <span className="font-medium">{fmt1(r.carneKg * pct)} kg</span>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
      <p className="mt-2 text-xs text-muted">
        Base: {BASE.h * 1000} g/adulto H · {BASE.m * 1000} g/adulto M · {BASE.c * 1000} g/criança · {BASE.latas} latas por quem bebe · 600 ml refri por quem não bebe
        {r.longo ? ` · +${Math.round((BASE.longa - 1) * 100)}% (festa longa)` : ""}. Arredondado pra cima, sem miséria.
      </p>

      <h3 className="mt-6 text-xs font-medium uppercase tracking-wide text-muted">Vaquinha (opcional)</h3>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {precos.map((f) => (
          <label key={f.label} className="block">
            <span className="text-xs text-muted">{f.label}</span>
            <input type="number" min={0} step="0.01" value={f.value}
              onChange={(e) => f.fn(e.target.value)} className={numCls} />
          </label>
        ))}
      </div>
      {r.total > 0 && r.adultos > 0 && (
        <p className="mt-2 text-sm">
          Total <span className="font-semibold">{brl(r.total)}</span>
          <span className="text-muted"> · {brl(r.porAdulto)}/adulto</span>
        </p>
      )}

      <h3 className="mt-6 text-xs font-medium uppercase tracking-wide text-muted">Acompanhamentos</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {ACOMP.map((a) => {
          const on = checks.includes(a);
          return (
            <button key={a} onClick={() => toggleCheck(a)} aria-pressed={on}
              className={`pressable rounded-full border px-3 py-1.5 text-xs font-medium transition-colors${on ? " border-foreground bg-foreground text-background line-through" : " border-border hover:border-foreground"}`}>
              {a}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={copy} disabled={vazio}
          className="pressable rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50">
          {copied ? "Copiado!" : "Copiar lista"}
        </button>
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-disabled={vazio}
          onClick={vazio ? (e) => e.preventDefault() : undefined}
          className={`pressable rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:border-foreground${vazio ? " pointer-events-none opacity-50" : ""}`}>
          Enviar no WhatsApp →
        </a>
      </div>
      <p className="mt-2 break-all text-xs text-muted">Link da conta: {link}</p>
    </div>
  );
}
