// lib/server-axios.js

import axios from "axios";
import { cookies } from "next/headers";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const serverApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Helper to add the token, now safe for server components
const getAuthHeaders = () => {
  // 1. Get the cookie store from the incoming server request
  const cookieStore = cookies();

  // 2. Get the specific cookie by name
  const authCookie = cookieStore.get("auth-storage");

  if (!authCookie?.value) {
    return {};
  }

  try {
    // 3. Parse the cookie value and extract the token
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

// --- The rest of the functions are identical in structure ---

// ✅ GET (Server-Safe)
export const getData = async (endpoint, auth = false) => {
  const headers = auth ? getAuthHeaders() : {};
  const res = await serverApi.get(endpoint, { headers });
  return res.data;
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
