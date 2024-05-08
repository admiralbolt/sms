import axios from "axios";

import { memoizedRefreshTokens } from "./auth";

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://seattlemusicscene.info:8000"
    : "http://localhost:8000";

const customAxios = axios.create({
  baseURL: baseUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Set authorization headers on load if we have an accessToken.
if (localStorage.getItem("accessToken") !== null) {
  customAxios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem("accessToken")}`;
}

customAxios.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

customAxios.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const config = error?.config;

    // If we get an error when we refresh our tokens, we don't want to end up
    // in an infinite refresh loop.
    if (error?.response?.status === 401 && !config?.sent) {
      config.sent = true;

      await memoizedRefreshTokens();
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return customAxios(config);
    }

    return Promise.reject(error);
  },
);

export default customAxios;
