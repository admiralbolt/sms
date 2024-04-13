import { useEffect, useState } from "react";
import customAxios from "./customAxios";

const useIsAuthenticated = (): [boolean, (auth: boolean) => void] => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(localStorage.getItem("accessToken") !== null);

  return [isAuthenticated, setIsAuthenticated];
}

const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  customAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

const login = async (username: string, password: string): Promise<any | null> => {
  try {
    const response = await customAxios.post("/api/token/", 
      {
        username: username,
        password: password,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    if (response.status != 200) {
      return response;
    }

    setTokens(response.data.access, response.data.refresh);
    return null;
  } catch (error: any) {
    return error;
  }
}

const logout = async (): Promise<Error | null> => {
  try {
    await customAxios.post("/api/logout", {
      refresh_token: localStorage.getItem("refreshToken"),
    },
      {withCredentials: true}
    );

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    customAxios.defaults.headers.common.Authorization = null;
    return null;
  } catch (error: any) {
    return error;
  }
}



export { login, logout, setTokens, useIsAuthenticated }