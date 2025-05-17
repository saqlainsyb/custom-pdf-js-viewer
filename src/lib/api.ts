// src/lib/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; 

// 1) Create a single Axios instance
const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,     // if you need cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2) Optional: set up interceptors for auth, logging, errors, etc.
// client.interceptors.request.use(...)
// client.interceptors.response.use(...)

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await client.get(url, config);
  if (config?.responseType === 'blob') {
    return response.data as T;
  }
  return response.data;
}


export async function post<T, U = unknown>(url: string, data?: U, config?: AxiosRequestConfig) {
  const response = await client.post<T>(url, data, config);
  return response.data;
}

export async function put<T, U = unknown>(url: string, data?: U, config?: AxiosRequestConfig) {
  const response = await client.put<T>(url, data, config);
  return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig) {
  const response = await client.delete<T>(url, config);
  return response.data;
}
