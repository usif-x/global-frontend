// lib/server-axios.js

import axios from "axios";
import https from "https";
import { cookies } from "next/headers";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Reuse TCP/TLS connections instead of opening a new one per request.
// This is the main fix for intermittent ECONNRESET / "socket hang up"
// errors on server-side requests.
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 10000, // ping interval to keep the socket alive
  maxSockets: 50,
});

const serverApi = axios.create({
  baseURL,
  httpsAgent,
  timeout: 15000, // fail fast & clearly instead of hanging indefinitely
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Helper to add the token, now safe for server components
const getAuthHeaders = () => {
  const cookieStore = cookies();
  const authCookie = cookieStore.get("auth-storage");

  if (!authCookie?.value) {
    return {};
  }

  try {
    const authData = JSON.parse(authCookie.value);
    const token = authData?.state?.token;

    if (!token) return {};

    return {
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.error("Failed to parse auth cookie on server:", error);
    return {};
  }
};

// ✅ Small retry wrapper specifically for connection-level failures
// (ECONNRESET / socket hang up), not for 4xx/5xx responses.
const isRetryableError = (error) =>
  !error.response &&
  (error.code === "ECONNRESET" ||
    error.message?.includes("socket hang up") ||
    error.code === "ETIMEDOUT");

const withRetry = async (fn, retries = 2) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === retries) throw error;
      // small backoff before retrying
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  throw lastError;
};

// ✅ GET (Server-Safe)
export const getData = async (endpoint, auth = false) => {
  const headers = auth ? getAuthHeaders() : {};
  return withRetry(async () => {
    const res = await serverApi.get(endpoint, { headers });
    return res.data;
  });
};

// ✅ POST (Server-Safe)
export const postData = async (endpoint, data, auth = false) => {
  const headers = auth ? getAuthHeaders() : {};
  const res = await serverApi.post(endpoint, data, { headers });
  return res.data;
};

// ✅ PUT (Server-Safe)
export const putData = async (endpoint, data, auth = false) => {
  const headers = auth ? getAuthHeaders() : {};
  const res = await serverApi.put(endpoint, data, { headers });
  return res.data;
};

// ✅ DELETE (Server-Safe)
export const deleteData = async (endpoint, auth = false) => {
  const headers = auth ? getAuthHeaders() : {};
  const res = await serverApi.delete(endpoint, { headers });
  return res.data;
};

export default serverApi;
