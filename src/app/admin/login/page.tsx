"use client";

import { useState, type FormEvent } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSent(false);

    if (!email.trim()) {
      setError("Digite seu email.");
      return;
    }

    try {
      const res = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) throw new Error("Erro ao enviar");

      setSent(true);
    } catch {
      setError("Erro ao enviar. Tente novamente.");
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-sm px-6 py-20 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Verifique seu email
        </h1>
        <p className="mt-2 text-sm text-muted">
          Se o email estiver cadastrado, você receberá um link de acesso em
          alguns segundos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-muted">
        Digite seu email para receber um link de acesso.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          autoFocus
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-[border-color] duration-150 ease-out focus:border-foreground"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-[color,transform] duration-150 ease-out hover:opacity-90 active:scale-95"
        >
          Enviar link
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
