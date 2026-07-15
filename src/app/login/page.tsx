"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import { inputStyle, authPageStyle, authFormStyle } from "../auth-form.styles";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await signIn.email({ email, password });

    if (error) {
      setMessage(error.message ?? "Something went wrong. Try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div style={authPageStyle}>
      <Card
        variant="glass"
        padding="lg"
        style={{ maxWidth: 400, width: "100%" }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 600,
            color: "#fff",
            marginBottom: 24,
          }}
        >
          Log in to CreatorOS
        </h1>
        <form onSubmit={handleSubmit} style={authFormStyle}>
          <input
            placeholder="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <Button type="submit" loading={loading} style={{ marginTop: 8 }}>
            Log in
          </Button>
        </form>
        {message && (
          <p style={{ color: "#e35d5d", fontSize: 13, marginTop: 16 }}>
            {message}
          </p>
        )}
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            marginTop: 20,
          }}
        >
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--color-accent)" }}>
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
