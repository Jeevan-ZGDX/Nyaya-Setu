/**
 * api.js — Centralised API client for Nyaya-Setu backend
 * All routes map to: http://localhost:8000
 */

const BASE_URL = "http://localhost:8000";

async function request(method, path, body = null, isFormData = false) {
  const options = { method, headers: {} };

  if (body) {
    if (isFormData) {
      options.body = body;
    } else {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, options);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.detail || json.message || "API error");
  }
  return json;
}

// POST /upload — multipart form
export async function uploadPDF(file) {
  const form = new FormData();
  form.append("file", file);
  return request("POST", "/upload", form, true);
}

// POST /process/{doc_id}
export async function processDocument(docId) {
  return request("POST", `/process/${docId}`);
}

// GET /document/{doc_id}
export async function getDocument(docId) {
  return request("GET", `/document/${docId}`);
}

// GET /actions?status=&department=&priority=
export async function getActions({ status, department, priority } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (department) params.set("department", department);
  if (priority) params.set("priority", priority);
  const qs = params.toString();
  return request("GET", `/actions${qs ? `?${qs}` : ""}`);
}

// POST /verify/{action_id}
export async function verifyAction(actionId, decision) {
  return request("POST", `/verify/${actionId}`, { decision });
}
