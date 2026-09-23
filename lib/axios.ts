import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

type RetryableRequest = InternalAxiosRequestConfig & { _authRetry?: boolean };

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const deviceId = localStorage.getItem("deviceId");
    if (deviceId && !config.headers["x-device-id"]) {
      config.headers["x-device-id"] = deviceId;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    if (!originalRequest) return Promise.reject(error);

    const path = originalRequest.url ?? "";
    const isAuthEntryPoint = /\/auth\/(login|register|forgot-password|reset-password|refresh|verify)/.test(path);

    if (error.response?.status !== 401 || originalRequest._authRetry || isAuthEntryPoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            const deviceId = typeof window !== "undefined" ? localStorage.getItem("deviceId") : null;
            if (deviceId) {
              originalRequest.headers["x-device-id"] = deviceId;
            }
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._authRetry = true;
    isRefreshing = true;

    const clientRefreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    const clientDeviceId = typeof window !== "undefined" ? localStorage.getItem("deviceId") : null;

    try {
      const { data } = await axios.post(
        "/api/auth/refresh",
        clientRefreshToken ? { refreshToken: clientRefreshToken } : {},
        {
          withCredentials: true,
          headers: clientDeviceId ? { "x-device-id": clientDeviceId } : undefined,
        }
      );

      const newAccess = data?.token || data?.accessToken;
      const newRefresh = data?.refreshToken;
      const newDeviceId = data?.deviceId;

      if (typeof window !== "undefined") {
        if (newAccess) {
          localStorage.setItem("accessToken", newAccess);
          localStorage.setItem("token", newAccess);
        }
        if (newRefresh) {
          localStorage.setItem("refreshToken", newRefresh);
        }
        if (newDeviceId) {
          localStorage.setItem("deviceId", newDeviceId);
        }
      }

      processQueue(null, newAccess);

      if (originalRequest.headers && newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        if (newDeviceId) {
          originalRequest.headers["x-device-id"] = newDeviceId;
        }
      }
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("deviceId");
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Request failed") {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<{ error?: string; message?: string }>).response?.data;
    return data?.error ?? data?.message ?? error.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export default api;
