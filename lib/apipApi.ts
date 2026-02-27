// lib/apipApi.ts
import { auth } from "./firebase";

const API_BASE =
  process.env.NEXT_PUBLIC_APIP_API_BASE ||
  "https://apip-api-571114772624.asia-southeast1.run.app";

type Json = Record<string, any>;

async function getIdToken(): Promise<string> {
  const u = auth.currentUser;
  if (!u) throw new Error("Not signed in");
  return await u.getIdToken(true);
}

export async function apipGet<T = any>(path: string): Promise<T> {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as Json) : {};
  if (!res.ok) throw new Error(data?.detail || `GET ${path} failed (${res.status})`);
  return data as T;
}

export async function apipPost<T = any>(path: string, body: any): Promise<T> {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as Json) : {};
  if (!res.ok) throw new Error(data?.detail || `POST ${path} failed (${res.status})`);
  return data as T;
}