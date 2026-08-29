import axios from "axios";

const api = axios.create({
  baseURL: "https://humorous-fulfillment-production-1f5e.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;