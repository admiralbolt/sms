import { useState } from "react";
import customAxios from "@/hooks/customAxios";
import mem from "mem";

const useIsAuthenticated = (): [boolean, (auth: boolean) => void] => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem("accessToken") !== null
  );

  return [isAuthenticated, setIsAuthenticated];
};

const refreshTokens = async () => {
  try {
    const response = await customAxios.post(
      "/api/token/refresh/",
      {
        refresh: localStorage.getItem("refreshToken"),
      },
      {
        withCredentials: true,
      }
    );

    if (response.data.access) {
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

// We only want to refresh tokens once every 10 seconds.
// Don't want a case where multiple refreshes are called in quick succession.
const memoizedRefreshTokens = mem(refreshTokens, { maxAge: 10000 });

const login = async (
  username: string,
  password: string
): Promise<any | null> => {
  try {
    const response = await customAxios.post(
      "/api/token/",
      {
        username: username,
        password: password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    if (response.status != 200) {
      return response;
    }

    localStorage.setItem("accessToken", response.data.access);
    localStorage.setItem("refreshToken", response.data.refresh);
    return null;
  } catch (error: any) {
    return error;
  }
};

const logout = async (): Promise<Error | null> => {
  try {
    await customAxios.post(
      "/api/logout",
      {
        refresh_token: localStorage.getItem("refreshToken"),
      },
      { withCredentials: true }
    );

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    customAxios.defaults.headers.common.Authorization = null;
    return null;
  } catch (error: any) {
    return error;
  }
};

export { login, logout, memoizedRefreshTokens, useIsAuthenticated };
