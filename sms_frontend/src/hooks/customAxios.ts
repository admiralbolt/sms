import axios from "axios";
import { logout, setTokens } from "./auth";

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://seattlemusicscene.info:8000"
    : "http://localhost:8000";

const customAxios = axios.create({
  baseURL: baseUrl,
  headers: {
    Accept: "application/json"
  }
});

// Set authorization headers on load if we have an accessToken.
if (localStorage.getItem("accessToken") !== null) {
  customAxios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem("accessToken")}`;
}

let refresh = false;

customAxios.interceptors.response.use(resp => resp, async error => {
  if (error.response.status === 401 && !refresh) {
    refresh = true;
    const response = await customAxios.post("/api/token/refresh/", 
      {
        refresh: localStorage.getItem("refreshToken")
      }, {
        withCredentials: true
      });

    if (response.status === 200) {
      setTokens(response.data.access, response.data.refresh);
      return customAxios(error.config);
    } else {
      // If our refresh fails we want to unset credentials.
      logout();
    }
  }

  refresh = false;
  return error;
});


export default customAxios;