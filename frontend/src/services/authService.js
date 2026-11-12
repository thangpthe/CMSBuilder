
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const authApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = async ({ identifier, password }) => {
  const response = await authApi.post("/api/auth/login", {
    identifier,
    password,
  });

  return response.data;
};
