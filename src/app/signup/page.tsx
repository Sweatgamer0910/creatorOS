"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import { inputStyle, authPageStyle, authFormStyle } from "../auth-form.styles";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await signUp.email({ name, email, password });

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
          Sign up for CreatorOS
        </h1>
        <form onSubmit={handleSubmit} style={authFormStyle}>
          <input
            placeholder="Name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <Button type="submit" loading={loading} style={{ marginTop: 8 }}>
            Create account
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
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-accent)" }}>
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
