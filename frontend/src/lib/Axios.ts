import axios from "axios";
import { toast } from "react-toastify";

export const isAxiosError = axios.isAxiosError;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
});

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    const message = response.data?.message;
    if (message && method !== "GET") {
      toast.success(message);
    }
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ??
      "Something went wrong. Please try again.";
    toast.error(message);
    return Promise.reject(error);
  },
);

export default api;
