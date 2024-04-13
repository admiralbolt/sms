import axios from "axios";
import { setTokens } from "./auth";

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

let refresh = false;

customAxios.interceptors.response.use(resp => resp, async error => {
  if (error.response.status === 401 && !refresh) {
    refresh = true;
    console.log(localStorage.getItem("refreshToken"));
    const response = await customAxios.post("/token/refresh/", 
      {
        refresh: localStorage.getItem("refreshToken")
      }, {
        withCredentials: true
      });

    if (response.status === 200) {
      setTokens(response.data.access, response.data.refresh);
      return customAxios(error.config);
    }
  }

  refresh = false;
  return error;
});


export default customAxios;