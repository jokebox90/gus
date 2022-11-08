import axios from "axios";
import toast from "react-hot-toast";

export const scheme = process.env.REACT_APP_SCHEME;
export const domain = process.env.REACT_APP_DOMAIN;
export const baseUrl = `${scheme}://${domain}`;

export const http = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const fetcher = (url) => {
  return sleep(300).then(() => {
    return http.get().then((r) => r.data);
  });
};

export const notifySuccess = (msg) => toast.success(msg);
export const notifyError = (msg) => toast.error(msg);
