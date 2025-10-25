"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          setError(data.message || "Not authenticated");
        }
      } catch (e) {
        setError("Failed to fetch user");
      }
    }
    loadUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (e) {
      // ignore
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        {user ? (
          <p className="mb-4">Welcome, {user.name} ({user.email})</p>
        ) : (
          <p className="mb-4 text-zinc-600 dark:text-zinc-400">{error || "Loading..."}</p>
        )}
        <Button onClick={logout}>Logout</Button>
      </div>
    </main>
  );
}