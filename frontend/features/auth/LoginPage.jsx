"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
import { login } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background ambient pastel glow */}
      <div className="login-backdrop-glow" />

      <div className="login-card">
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-logo-mark">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v2" />
              <path d="M12 9l9 5.5a1 1 0 0 1 .5.86V16a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-.64a1 1 0 0 1 .5-.86L12 9z" />
            </svg>
          </div>
          <h1>Clothify</h1>
          <p>Style. Stock. Success. — Fashion Retail Management</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="operation-alert error" role="alert">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="operation-field">
            <span>Email Address</span>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="admin@clothify.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="operation-field">
            <span>Password</span>
            <div className="relative">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              "Signing in..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Sign in to Dashboard</span>
                <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
