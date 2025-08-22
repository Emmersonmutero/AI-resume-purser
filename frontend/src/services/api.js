// src/services/api.js
// Minimal client to call your FastAPI with Firebase ID token
import { auth } from "../utils/firebase";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function idToken() {
  const u = auth.currentUser;
  if (!u) throw new Error("Not authenticated");
  return await u.getIdToken(/* forceRefresh */ true);
}

export async function apiParseFile(file, jd) {
  const token = await idToken();
  const form = new FormData();
  form.append("file", file);
  form.append("job_description", jd);
  const res = await fetch(`${API_BASE}/api/parse-resume`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiUpdateUserProfile(data) {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiScore(resumeObj, jd, resumeId) {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resume: resumeObj, jd, resumeId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiIndexResume(resumeId, parsed) {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/index-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ resumeId, parsed }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiSemanticSearch(q, topK = 20) {
  const token = await idToken();
  const url = new URL(`${API_BASE}/api/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("top_k", String(topK));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiGetJobs() {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiCreateJob(jobData) {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiUpdateJob(jobId, jobData) {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiDeleteJob(jobId) {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiGetUserUploadHistory() {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/users/upload-history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiGetDashboardOverview() {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiGetNotifications() {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiMarkNotificationAsRead(notificationId) {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/notifications/${notificationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ read: true }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiMarkAllNotificationsAsRead() {
  const token = await idToken();
  const res = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}