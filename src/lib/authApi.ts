import { Owner } from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function loginOwner(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/owner/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  return { token: json.token, owner: json.owner_instance as Owner };
}

export async function signupOwner(name: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/owner/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Signup failed");
  return { token: json.token, owner: json.user as Owner };
}
