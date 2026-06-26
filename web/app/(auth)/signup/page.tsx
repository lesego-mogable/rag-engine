"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/login");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div
      className="w-full rounded-[12px] p-8"
      style={{
        maxWidth: 400,
        background: "#fff",
        boxShadow: "0 4px 24px rgba(30,27,74,.10), 0 1px 3px rgba(30,27,74,.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <img src="/logo-64.png" alt="lsg-RAG" style={{ width: 32, height: 32, borderRadius: 6 }} />
        <span className="font-bold text-[16px]" style={{ color: "#1e1b4b" }}>lsg-RAG</span>
        <span
          className="text-white font-bold rounded-[3px] px-[5px] py-[1.5px]"
          style={{ background: "#6366f1", fontSize: "8.5px" }}
        >
          AI
        </span>
      </div>

      <h1 className="text-[20px] font-bold mb-1" style={{ color: "#1e1b4b" }}>
        Create your account
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "#94a3b8" }}>
        Get started with lsg-RAG AI
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "#1e1b4b" }}>
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
            className="w-full rounded-[8px] px-3 py-2.5 text-[13.5px] outline-none transition-all"
            style={{ border: "1.5px solid #e5e7f2", color: "#1e1b4b", background: "#fafbff" }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7f2")}
          />
        </div>

        <div>
          <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "#1e1b4b" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="w-full rounded-[8px] px-3 py-2.5 text-[13.5px] outline-none transition-all"
            style={{ border: "1.5px solid #e5e7f2", color: "#1e1b4b", background: "#fafbff" }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7f2")}
          />
        </div>

        <div>
          <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "#1e1b4b" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
            className="w-full rounded-[8px] px-3 py-2.5 text-[13.5px] outline-none transition-all"
            style={{ border: "1.5px solid #e5e7f2", color: "#1e1b4b", background: "#fafbff" }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7f2")}
          />
        </div>

        {error && (
          <div
            className="rounded-[7px] px-3 py-2.5 text-[12.5px] font-medium"
            style={{ background: "#fee2e2", color: "#dc2626" }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[8px] py-2.5 text-[13.5px] font-semibold text-white transition-colors"
          style={{ background: loading ? "#a5b4fc" : "#6366f1" }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#4f46e5"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#6366f1"; }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-[12.5px] mt-5" style={{ color: "#94a3b8" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold transition-colors"
          style={{ color: "#6366f1" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
