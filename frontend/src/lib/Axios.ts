import axios from "axios";

export const isAxiosError = axios.isAxiosError;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
});

export default api;
