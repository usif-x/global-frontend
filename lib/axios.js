import axios from "axios";
import Cookies from "js-cookie";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Helper لإضافة التوكن
const getAuthHeaders = () => {
  const token = Cookies.get("auth-storage")
    ? JSON.parse(Cookies.get("auth-storage")).state?.token
    : null;

  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ✅ GET
export const getData = async (endpoint, auth = false) => {
  const headers = auth ? getAuthHeaders() : {};
  const res = await api.get(endpoint, { headers });
  return res.data;
};

// ✅ POST
export const postData = async (endpoint, data, auth = false) => {
  const headers = auth ? getAuthHeaders() : {};
  const res = await api.post(endpoint, data, { headers });
  return res.data;
};

// ✅ PUT
export const putData = async (endpoint, data, auth = false) => {
  const headers = auth ? getAuthHeaders() : {};
  const res = await api.put(endpoint, data, { headers });
  return res.data;
};

// ✅ DELETE
export const deleteData = async (endpoint, auth = false) => {
  const headers = auth ? getAuthHeaders() : {};
  const res = await api.delete(endpoint, { headers });
  return res.data;
};

export default api;
