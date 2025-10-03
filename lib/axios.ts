import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

export default api;
